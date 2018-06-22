import { Subject } from 'rxjs';
import { IEvent } from './event.interface';

export interface IMessageSource {
  bridgeEventsTo<T extends IEvent>(subject: Subject<T>);
}
