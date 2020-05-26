import { IEvent } from './event.interface';
import { Subject } from "rxjs";

export interface IEventPublisher<EventBase extends IEvent = IEvent> {
  publish<T extends EventBase = EventBase>(pattern: string, event: T): any;
  bridgeEventsTo<T extends EventBase>(subject: Subject<T>);
}
