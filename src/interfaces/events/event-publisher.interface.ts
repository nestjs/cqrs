import { IEvent } from './event.interface';

export interface IEventPublisher<T extends IEvent = IEvent> {
  publish(event: T);
}
