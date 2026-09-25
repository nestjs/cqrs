import type { IEvent } from './events/event.interface.js';

/**
 * Represents the aggregate root interface with event sourcing capabilities.
 */
export interface IAggregateRoot<EventBase extends IEvent = IEvent> {
  /**
   * Sets or gets the auto-commit flag.
   */
  autoCommit: boolean;

  /**
   * Publishes a single event.
   * @param event The event to publish.
   * @param dispatcherContext Dispatcher context passed to the event publisher, such as
   * `{ transaction }`. Defaults to the aggregate (merged with `EventPublisher`) or none (`@Publishable()`).
   * @returns What the event bus returns (the event publisher's result).
   */
  publish<T extends EventBase = EventBase>(
    event: T,
    dispatcherContext?: unknown,
  ): any;

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param dispatcherContext Dispatcher context passed to the event publisher, such as
   * `{ transaction }`. Defaults to the aggregate (merged with `EventPublisher`) or none (`@Publishable()`).
   * @returns What the event bus returns (the event publisher's result).
   */
  publishAll<T extends EventBase = EventBase>(
    events: T[],
    dispatcherContext?: unknown,
  ): any;

  /**
   * Commits all uncommitted events.
   * The events are cleared once they are handed to the event bus, before an asynchronous publisher settles.
   * @param dispatcherContext Dispatcher context passed to the event publisher, such as
   * `{ transaction }`. Defaults to the aggregate (merged with `EventPublisher`) or none (`@Publishable()`).
   * @returns What `publishAll()` returns: await it to wait for (and catch the errors of) an asynchronous publisher.
   */
  commit(dispatcherContext?: unknown): any;

  /**
   * Uncommits all events.
   */
  uncommit(): void;

  /**
   * Gets all uncommitted events.
   * @returns An array of uncommitted events.
   */
  getUncommittedEvents(): EventBase[];

  /**
   * Loads aggregate root state from event history.
   * @param history The event history to load.
   */
  loadFromHistory(history: EventBase[]): void;

  /**
   * Applies an event to the aggregate root.
   * @param event The event to apply.
   * @param isFromHistory Optional flag indicating if the event is from history.
   */
  apply<T extends EventBase = EventBase>(
    event: T,
    isFromHistory?: boolean,
  ): void;

  /**
   * Applies an event to the aggregate root with options.
   * @param event The event to apply.
   * @param options Options for applying the event.
   */
  apply<T extends EventBase = EventBase>(
    event: T,
    options?: { fromHistory?: boolean; skipHandler?: boolean },
  ): void;
}
