import { Subject } from 'rxjs';
import { IEvent, IEventPublisher, IMessageSource } from '../interfaces';

export class DefaultPubSub implements IEventPublisher, IMessageSource {
  private subject$: Subject<any>;

  publish(event: IEvent) {
    if (!this.subject$) {
      throw new Error('Invalid underlying subject (call bridgeEventsTo())');
    }
    this.subject$.next(event);
  }

  bridgeEventsTo<T extends IEvent>(subject: Subject<T>) {
    this.subject$ = subject;
  }
}
