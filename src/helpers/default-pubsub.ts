import { Subject } from 'rxjs';
import { IEvent } from '../interfaces';
import { IEventPublisher } from '../interfaces/events/event-publisher.interface';
import { IMessageSource } from '../interfaces/events/message-source.interface';

export class DefaultPubSub implements IEventPublisher, IMessageSource {
  private subject$: Subject<any>;

  publish<T extends IEvent>(event: T) {
    if (!this.subject$) {
      throw new Error('Invalid underlying subject (call bridgeEventsTo())');
    }
    this.subject$.next(event);
  }

  bridgeEventsTo<T extends IEvent>(subject: Subject<T>) {
    this.subject$ = subject;
  }
}
