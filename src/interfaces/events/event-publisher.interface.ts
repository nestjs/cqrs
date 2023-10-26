import { IEvent } from './event.interface';

export interface IEventPublisher<EventBase extends IEvent<TResponse> = IEvent, TResponse = any> {
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param context The context.
   */
  publish<TEvent extends EventBase>(event: TEvent, context?: unknown): TResponse;

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param context The context.
   */
  publishAll?<TEvent extends EventBase>(
    events: TEvent[],
    context?: unknown,
  ): TResponse;
}
