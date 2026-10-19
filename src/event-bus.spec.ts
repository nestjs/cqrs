import { Logger } from '@nestjs/common';
import {
  config,
  Observable,
  combineLatest,
  defer,
  from,
  map,
  merge,
  shareReplay,
  startWith,
} from 'rxjs';
import { CommandBus } from './command-bus.js';
import { EventBus } from './event-bus.js';
import { CqrsModuleOptions } from './interfaces/index.js';
import { UnhandledExceptionBus } from './unhandled-exception-bus.js';

class OrderEvent {
  constructor(public readonly valid: boolean) {}
}

class InitCommand {}

const LOOP_GUARD = 1000;

describe('EventBus', () => {
  describe('when a saga throws', () => {
    let eventBus: EventBus;
    let executedCommands: unknown[];
    let errors: number;
    let loggerSpy: ReturnType<typeof vi.spyOn>;

    const createEventBus = (options?: CqrsModuleOptions) => {
      const commandBus = {
        execute: async (command: unknown) => {
          executedCommands.push(command);
        },
      } as unknown as CommandBus;
      const unhandledExceptionBus = new UnhandledExceptionBus();
      eventBus = new EventBus(
        commandBus,
        {} as any,
        unhandledExceptionBus,
        options,
      );
      unhandledExceptionBus.subscribe(() => {
        errors++;
        // A saga that resubscribes without a delay never stops; end the loop so the test fails instead of hanging.
        if (errors === LOOP_GUARD) {
          eventBus.onModuleDestroy();
        }
      });
    };

    const registerSaga = (
      saga: (events$: Observable<any>) => Observable<any>,
    ) => (eventBus as any).registerSaga(saga);

    const throwOnInvalid = map((event: OrderEvent) => {
      if (!event.valid) {
        throw new Error('invalid order');
      }
      return { type: 'command' };
    });

    beforeEach(() => {
      vi.useFakeTimers();
      executedCommands = [];
      errors = 0;
      loggerSpy = vi
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      eventBus.onModuleDestroy();
      loggerSpy.mockRestore();
      vi.useRealTimers();
    });

    describe('by default', () => {
      it('should stop reacting to later events', async () => {
        createEventBus();
        registerSaga((events$) => events$.pipe(throwOnInvalid));

        eventBus.publish(new OrderEvent(false));
        await vi.advanceTimersByTimeAsync(60_000);
        eventBus.publish(new OrderEvent(true));
        await vi.advanceTimersByTimeAsync(0);

        expect(errors).toBe(1);
        expect(executedCommands).toHaveLength(0);
      });

      it('should run commands emitted on subscription once', async () => {
        createEventBus();
        registerSaga((events$) =>
          events$.pipe(throwOnInvalid, startWith(new InitCommand())),
        );

        eventBus.publish(new OrderEvent(false));
        await vi.advanceTimersByTimeAsync(60_000);
        eventBus.publish(new OrderEvent(false));
        await vi.advanceTimersByTimeAsync(60_000);

        expect(executedCommands).toHaveLength(1);
      });
    });

    describe('with sagaErrorStrategy set to "resubscribe"', () => {
      beforeEach(() => createEventBus({ sagaErrorStrategy: 'resubscribe' }));

      it('should keep reacting to events after errors on separate events', async () => {
        registerSaga((events$) => events$.pipe(throwOnInvalid));

        for (let i = 0; i < 12; i++) {
          eventBus.publish(new OrderEvent(false));
          await vi.advanceTimersByTimeAsync(60_000);
        }
        eventBus.publish(new OrderEvent(true));
        await vi.advanceTimersByTimeAsync(0);

        expect(errors).toBe(12);
        expect(executedCommands).toHaveLength(1);
        expect(loggerSpy).toHaveBeenCalledTimes(12);
        expect(loggerSpy).toHaveBeenCalledWith(
          'Saga "" has thrown an unhandled exception.',
          new Error('invalid order'),
        );
      });

      it('should double the delay before each resubscription up to 30 seconds', async () => {
        const subscribedAt: number[] = [];
        registerSaga((events$) =>
          merge(
            events$,
            defer(() => {
              subscribedAt.push(Date.now());
              throw new Error('fails on subscribe');
            }),
          ),
        );

        await vi.advanceTimersByTimeAsync(200_000);

        const delays = subscribedAt
          .slice(1)
          .map((time, i) => time - subscribedAt[i]);
        expect(delays.slice(0, 12)).toEqual([
          100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 30_000, 30_000,
          30_000,
        ]);
        expect(errors).toBe(subscribedAt.length);
        expect(executedCommands).toHaveLength(0);
      });

      it('should not reset the delay after a successful event', async () => {
        const subscribedAt: number[] = [];
        registerSaga((events$) =>
          defer(() => {
            subscribedAt.push(Date.now());
            return events$;
          }).pipe(throwOnInvalid),
        );

        eventBus.publish(new OrderEvent(false));
        await vi.advanceTimersByTimeAsync(10_000);
        eventBus.publish(new OrderEvent(true));
        eventBus.publish(new OrderEvent(false));
        await vi.advanceTimersByTimeAsync(10_000);

        expect(executedCommands).toHaveLength(1);
        expect(subscribedAt.map((time) => time - subscribedAt[0])).toEqual([
          0, 100, 10_200,
        ]);
      });

      it('should bound by time a saga that replays the failing event on every resubscription', async () => {
        registerSaga((events$) => events$.pipe(shareReplay(2), throwOnInvalid));

        eventBus.publish(new OrderEvent(true));
        eventBus.publish(new OrderEvent(false));
        await vi.advanceTimersByTimeAsync(1000);

        // Resubscriptions at 100, 300 and 700 ms replay both events: the command runs again and the error recurs.
        expect(errors).toBe(4);
        expect(executedCommands).toHaveLength(4);
      });

      it('should let timers fire while a saga fails on a rejected promise', async () => {
        const rejected = Promise.reject(new Error('missing configuration'));
        rejected.catch(() => {});
        let errorsWhenTimerFired: number | undefined;
        setTimeout(() => (errorsWhenTimerFired = errors), 50);

        registerSaga((events$) =>
          combineLatest([events$, from(rejected)]).pipe(map(() => null)),
        );
        await vi.advanceTimersByTimeAsync(1000);

        expect(errorsWhenTimerFired).toBe(1);
        expect(errors).toBe(4);
      });

      it('should run commands emitted on subscription again after every error', async () => {
        registerSaga((events$) =>
          events$.pipe(throwOnInvalid, startWith(new InitCommand())),
        );

        eventBus.publish(new OrderEvent(false));
        await vi.advanceTimersByTimeAsync(60_000);
        eventBus.publish(new OrderEvent(false));
        await vi.advanceTimersByTimeAsync(60_000);

        expect(
          executedCommands.filter((command) => command instanceof InitCommand),
        ).toHaveLength(3);
      });
    });

    describe('with rethrowUnhandled set', () => {
      let unhandled: unknown[];

      beforeEach(() => {
        unhandled = [];
        config.onUnhandledError = (error) => unhandled.push(error);
      });

      afterEach(() => {
        config.onUnhandledError = null;
      });

      it('should rethrow instead of publishing or resubscribing', async () => {
        createEventBus({
          rethrowUnhandled: true,
          sagaErrorStrategy: 'resubscribe',
        });
        registerSaga((events$) => events$.pipe(throwOnInvalid));

        eventBus.publish(new OrderEvent(false));
        await vi.advanceTimersByTimeAsync(60_000);
        eventBus.publish(new OrderEvent(true));
        await vi.advanceTimersByTimeAsync(0);

        expect(unhandled).toHaveLength(1);
        expect(errors).toBe(0);
        expect(executedCommands).toHaveLength(0);
      });
    });
  });
});
