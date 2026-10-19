import { Logger } from '@nestjs/common';
import {
  Observable,
  combineLatest,
  from,
  map,
  merge,
  shareReplay,
  timer,
} from 'rxjs';
import {
  CommandBus,
  EventBus,
  UnhandledExceptionBus,
} from '../../src/index.js';

class OrderEvent {
  constructor(public readonly valid: boolean) {}
}

const LOOP_GUARD = 1000;

describe('Saga that keeps throwing', () => {
  let eventBus: EventBus;
  let executedCommands: number;
  let errors: number;
  let loggerSpy: ReturnType<typeof vi.spyOn>;

  const registerSaga = (saga: (events$: Observable<any>) => Observable<any>) =>
    (eventBus as any).registerSaga(saga);

  beforeEach(() => {
    executedCommands = 0;
    errors = 0;
    loggerSpy = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    const commandBus = {
      execute: async () => {
        executedCommands++;
      },
    } as unknown as CommandBus;
    const unhandledExceptionBus = new UnhandledExceptionBus();
    eventBus = new EventBus(commandBus, {} as any, unhandledExceptionBus);
    unhandledExceptionBus.subscribe(() => {
      errors++;
      // Without a limit some of these sagas never stop; end the loop so the test fails instead of hanging.
      if (errors === LOOP_GUARD) {
        eventBus.onModuleDestroy();
      }
    });
  });

  afterEach(() => {
    eventBus.onModuleDestroy();
    loggerSpy.mockRestore();
    vi.useRealTimers();
  });

  const stopLogs = () =>
    loggerSpy.mock.calls.filter(([message]) =>
      String(message).includes('has been stopped after'),
    );

  it('should stop a saga that replays the failing event on every resubscription', async () => {
    registerSaga((events$) =>
      events$.pipe(
        shareReplay(2),
        map((event: OrderEvent) => {
          if (!event.valid) {
            throw new Error('invalid order');
          }
          return { type: 'command' };
        }),
      ),
    );

    eventBus.publish(new OrderEvent(true));
    eventBus.publish(new OrderEvent(false));
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(errors).toBe(10);
    expect(executedCommands).toBe(10);
    expect(stopLogs()).toHaveLength(1);
  });

  it('should stop a saga combined with a rejected promise without starving the event loop', async () => {
    const rejected = Promise.reject(new Error('missing configuration'));
    rejected.catch(() => {});
    const timerFired = new Promise<number>((resolve) =>
      setTimeout(() => resolve(errors), 0),
    );

    registerSaga((events$) =>
      combineLatest([events$, from(rejected)]).pipe(map(() => null)),
    );

    expect(await timerFired).toBeLessThanOrEqual(10);
    expect(errors).toBe(10);
    expect(stopLogs()).toHaveLength(1);
  });

  it('should stop a saga whose stream errors again on its own after each resubscription', () => {
    vi.useFakeTimers();
    registerSaga((events$) =>
      merge(
        events$,
        timer(50).pipe(
          map(() => {
            throw new Error('timer failed');
          }),
        ),
      ),
    );

    vi.advanceTimersByTime(5000);

    expect(errors).toBe(10);
    expect(stopLogs()).toHaveLength(1);
  });

  it('should keep a saga that throws on events more than a second apart', async () => {
    vi.useFakeTimers();
    registerSaga((events$) =>
      events$.pipe(
        map((event: OrderEvent) => {
          if (!event.valid) {
            throw new Error('invalid order');
          }
          return { type: 'command' };
        }),
      ),
    );

    for (let i = 0; i < 15; i++) {
      eventBus.publish(new OrderEvent(false));
      vi.advanceTimersByTime(1000);
    }
    eventBus.publish(new OrderEvent(true));
    await vi.runAllTimersAsync();

    expect(errors).toBe(15);
    expect(executedCommands).toBe(1);
    expect(stopLogs()).toHaveLength(0);
  });
});
