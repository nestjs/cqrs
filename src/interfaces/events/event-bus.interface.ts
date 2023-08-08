import { IEvent } from './event.interface';

/**
 * Represents an event bus.
 */
export interface IEventBus<EventBase extends IEvent = IEvent> {
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param context The context.
   */
  publish<TEvent extends EventBase, TContext = unknown>(
    event: TEvent,
    context?: TContext,
  ): any;

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param context The context.
   */
  publishAll<TEvent extends EventBase, TContext = unknown>(
    events: TEvent[],
    context?: TContext,
  ): any;
}
