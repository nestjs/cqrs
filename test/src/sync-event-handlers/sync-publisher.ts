import { lastValueFrom, map, merge, of } from 'rxjs';
import { IEvent, IEventPublisher } from '../../../src/interfaces';
import { EventOperator } from '../../../src/event-bus';

export class SyncPublisher<EventBase extends IEvent>
  implements IEventPublisher<EventBase>
{
  private eventOperators: EventOperator<EventBase>[] = [];

  async publish<T extends EventBase>(event: T) {
    const event$ = of(event);

    await lastValueFrom(
      merge(
        event$.pipe(map(() => undefined)),
        ...this.eventOperators.map((operator) => event$.pipe(operator)),
      ),
    );
  }

  setEventOperators<T extends EventBase>(eventOperators: EventOperator<T>[]) {
    this.eventOperators = eventOperators;
  }
}
