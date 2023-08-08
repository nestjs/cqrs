import { IEvent } from './event.interface';

export interface IEventPublisher<EventBase extends IEvent = IEvent> {
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param context The context.
   */
  publish<TEvent extends EventBase>(event: TEvent, context?: unknown): any;

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param context The context.
   */
  publishAll?<TEvent extends EventBase>(
    events: TEvent[],
    context?: unknown,
  ): any;
}
