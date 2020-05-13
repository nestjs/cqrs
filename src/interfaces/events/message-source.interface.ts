import { Subject } from 'rxjs';
import { IEvent } from './event.interface';

export interface IMessageSource<EventBase extends IEvent = IEvent> {
  bridgeEventsTo<T extends EventBase>(subject: Subject<T>): any;
}
