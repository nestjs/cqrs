import { AsyncContext } from '../../scopes/index.js';
import { IEvent } from './event.interface.js';

export interface IEventPublisher<EventBase extends IEvent = IEvent> {
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param dispatcherContext Dispatcher context or undefined.
   * @param asyncContext The async context (if scoped).
   */
  publish<TEvent extends EventBase>(
    event: TEvent,
    dispatcherContext?: unknown,
    asyncContext?: AsyncContext,
  ): any;

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param dispatcherContext Dispatcher context or undefined.
   * @param asyncContext The async context (if scoped).
   */
  publishAll?<TEvent extends EventBase>(
    events: TEvent[],
    dispatcherContext?: unknown,
    asyncContext?: AsyncContext,
  ): any;
}
