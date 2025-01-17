/* eslint-disable @typescript-eslint/no-unused-vars */

import { Type } from '@nestjs/common';
import { IEvent, IEventHandler } from './interfaces';

const INTERNAL_EVENTS = Symbol();
const IS_AUTO_COMMIT_ENABLED = Symbol();

/**
 * Represents an aggregate root.
 * An aggregate root is an entity that represents a meaningful concept in the domain.
 * It is the root of an aggregate, which is a cluster of domain objects that can be treated as a single unit.
 *
 * @template EventBase The base type of the events.
 */
export abstract class AggregateRoot<EventBase extends IEvent = IEvent> {
  public [IS_AUTO_COMMIT_ENABLED] = false;
  private readonly [INTERNAL_EVENTS]: EventBase[] = [];

  /**
   * Sets whether the aggregate root should automatically commit events.
   */
  set autoCommit(value: boolean) {
    this[IS_AUTO_COMMIT_ENABLED] = value;
  }

  /**
   * Gets whether the aggregate root should automatically commit events.
   */
  get autoCommit(): boolean {
    return this[IS_AUTO_COMMIT_ENABLED];
  }

  /**
   * Publishes an event. Must be merged with the publisher context in order to work.
   * @param event The event to publish.
   */
  publish<T extends EventBase = EventBase>(event: T) {}

  /**
   * Publishes multiple events. Must be merged with the publisher context in order to work.
   * @param events The events to publish.
   */
  publishAll<T extends EventBase = EventBase>(events: T[]) {}

  /**
   * Commits all uncommitted events.
   */
  commit() {
    this.publishAll(this[INTERNAL_EVENTS]);
    this[INTERNAL_EVENTS].length = 0;
  }

  /**
   * Uncommits all events.
   */
  uncommit() {
    this[INTERNAL_EVENTS].length = 0;
  }

  /**
   * Returns all uncommitted events.
   * @returns All uncommitted events.
   */
  getUncommittedEvents(): EventBase[] {
    return this[INTERNAL_EVENTS];
  }

  /**
   * Loads events from history.
   * @param history The history to load.
   */
  loadFromHistory(history: EventBase[]) {
    history.forEach((event) => this.apply(event, true));
  }

  /**
   * Applies an event.
   * If auto commit is enabled, the event will be published immediately (note: must be merged with the publisher context in order to work).
   * Otherwise, the event will be stored in the internal events array, and will be published when the commit method is called.
   * Also, the corresponding event handler will be called (if exists).
   * For example, if the event is called UserCreatedEvent, the "onUserCreatedEvent" method will be called.
   *
   * @param event The event to apply.
   * @param isFromHistory Whether the event is from history.
   */
  apply<T extends EventBase = EventBase>(
    event: T,
    isFromHistory?: boolean,
  ): void;
  /**
   * Applies an event.
   * If auto commit is enabled, the event will be published immediately (note: must be merged with the publisher context in order to work).
   * Otherwise, the event will be stored in the internal events array, and will be published when the commit method is called.
   * Also, the corresponding event handler will be called (if exists).
   * For example, if the event is called UserCreatedEvent, the "onUserCreatedEvent" method will be called.
   *
   * @param event The event to apply.
   * @param options The options.
   */
  apply<T extends EventBase = EventBase>(
    event: T,
    options?: { fromHistory?: boolean; skipHandler?: boolean },
  ): void;
  apply<T extends EventBase = EventBase>(
    event: T,
    optionsOrIsFromHistory:
      | boolean
      | { fromHistory?: boolean; skipHandler?: boolean } = {},
  ): void {
    const isFromHistory =
      (typeof optionsOrIsFromHistory === 'boolean'
        ? optionsOrIsFromHistory
        : optionsOrIsFromHistory.fromHistory) ?? false;
    const skipHandler =
      typeof optionsOrIsFromHistory === 'boolean'
        ? false
        : optionsOrIsFromHistory.skipHandler;

    if (!isFromHistory && !this.autoCommit) {
      this[INTERNAL_EVENTS].push(event);
    }
    this.autoCommit && this.publish(event);

    if (!skipHandler) {
      const handler = this.getEventHandler(event);
      handler && handler.call(this, event);
    }
  }

  protected getEventHandler<T extends EventBase = EventBase>(
    event: T,
  ): Type<IEventHandler> | undefined {
    const handler = `on${this.getEventName(event)}`;
    return this[handler];
  }

  protected getEventName(event: any): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }
}
