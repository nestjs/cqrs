import { IEvent } from './event.interface';

export interface IEventBus<EventBase extends IEvent = IEvent> {
  publish<T extends EventBase>(pattern: string, event: T);
  publishAll(pattern: string, events: EventBase[]);
  publishLocally<T extends EventBase>(event: T);
  publishAllLocally(events: EventBase[]);
}
