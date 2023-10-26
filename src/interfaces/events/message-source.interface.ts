import { Subject } from 'rxjs';
import { IEvent } from './event.interface';

export interface IMessageSource<EventBase extends IEvent<TResponse> = IEvent, TResponse = any> {
  bridgeEventsTo<T extends EventBase>(subject: Subject<T>): TResponse;
}
