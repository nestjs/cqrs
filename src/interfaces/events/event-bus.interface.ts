import { AsyncContext } from '../../scopes/async.context';
import { IEvent } from './event.interface';

/**
 * Represents an event bus.
 */
export interface IEventBus<EventBase extends IEvent = IEvent> {
  /**
   * Publishes an event.
   * @param event The event to publish.
   */
  publish<TEvent extends EventBase>(event: TEvent): any;
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param asyncContext Async context
   */
  publish<TEvent extends EventBase>(
    event: TEvent,
    asyncContext: AsyncContext,
  ): any;
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param dispatcherContext Dispatcher context
   */
  publish<TEvent extends EventBase, TContext = unknown>(
    event: TEvent,
    dispatcherContext: TContext,
  ): any;
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param dispatcherContext Dispatcher context
   * @param asyncContext Async context
   */
  publish<TEvent extends EventBase, TContext = unknown>(
    event: TEvent,
    dispatcherContext: TContext,
    asyncContext: AsyncContext,
  ): any;

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   */
  publishAll<TEvent extends EventBase>(events: TEvent[]): any;
  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param asyncContext Async context
   */
  publishAll<TEvent extends EventBase>(
    events: TEvent[],
    asyncContext: AsyncContext,
  ): any;
  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param dispatcherContext Dispatcher context
   */
  publishAll<TEvent extends EventBase, TContext = unknown>(
    events: TEvent[],
    dispatcherContext: TContext,
  ): any;
  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param dispatcherContext Dispatcher context
   * @param asyncContext Async context
   */
  publishAll<TEvent extends EventBase, TContext = unknown>(
    events: TEvent[],
    dispatcherContext: TContext,
    asyncContext: AsyncContext,
  ): any;
}
