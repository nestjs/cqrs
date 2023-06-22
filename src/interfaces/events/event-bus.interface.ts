import { IEvent } from './event.interface';

/**
 * Represents an event bus.
 */
export interface IEventBus<EventBase extends IEvent = IEvent> {
  /**
   * Publishes an event.
   * @param event The event to publish.
   */
  publish<T extends EventBase>(event: T);

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   */
  publishAll(events: EventBase[]);
}
