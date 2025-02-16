import { AsyncContext } from '../../scopes';
import { IEvent } from './event.interface';

export interface IEventPublisher<
  EventBase extends IEvent = IEvent,
  PublishResult = any,
  PublishAllResult = any,
> {
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
  ): PublishResult;

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
  ): PublishAllResult;
}

export type PublisherPublishResult<P extends IEventPublisher> =
  P extends IEventPublisher<any, infer PublishResult> ? PublishResult : never;

export type PublisherPublishAllResult<P extends IEventPublisher> =
  P extends IEventPublisher<any, infer PublishResult, infer PublishAllResult>
    ? P['publishAll'] extends Function
      ? PublishAllResult
      : PublishResult[]
    : never;
