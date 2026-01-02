import type { IEvent } from './events/event.interface';

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
   */
  publish<T extends EventBase = EventBase>(event: T): void;

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   */
  publishAll<T extends EventBase = EventBase>(events: T[]): void;

  /**
   * Commits all uncommitted events.
   */
  commit(): void;

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
