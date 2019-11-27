import { Subject } from 'rxjs';
import { IEvent, IEventPublisher, IMessageSource } from '../interfaces';

export class DefaultPubSub<EventBase extends IEvent>
  implements IEventPublisher<EventBase>, IMessageSource<EventBase> {
  private subject$: Subject<EventBase>;

  publish<T extends EventBase>(event: T) {
    if (!this.subject$) {
      throw new Error('Invalid underlying subject (call bridgeEventsTo())');
    }
    this.subject$.next(event);
  }

  bridgeEventsTo<T extends EventBase>(subject: Subject<T>) {
    this.subject$ = subject;
  }
}
