import { Injectable } from '@nestjs/common';
import { EventBus } from './event-bus.js';
import { IAggregateRoot, IEvent } from './interfaces/index.js';
import { AsyncContext } from './scopes/index.js';

export interface Constructor<T> {
  new (...args: any[]): T;
}

/**
 * @publicApi
 */
@Injectable()
export class EventPublisher<EventBase extends IEvent = IEvent> {
  constructor(private readonly eventBus: EventBus<EventBase>) {}

  /**
   * Merge the event publisher into the provided class.
   * This is required to make `publish` and `publishAll` available on the `AggregateRoot` class.
   * The aggregate is the dispatcher context, unless `commit()`, `publish()` or `publishAll()` is given one.
   * @param metatype The class to merge into.
   * @param asyncContext The async context (if scoped).
   */
  mergeClassContext<T extends Constructor<IAggregateRoot<EventBase>>>(
    metatype: T,
    asyncContext?: AsyncContext,
  ): T {
    const eventBus = this.eventBus;
    return class extends metatype {
      publish(event: EventBase, dispatcherContext?: unknown) {
        return eventBus.publish(
          event,
          dispatcherContext === undefined ? this : dispatcherContext,
          asyncContext as AsyncContext,
        );
      }

      publishAll(events: EventBase[], dispatcherContext?: unknown) {
        return eventBus.publishAll(
          events,
          dispatcherContext === undefined ? this : dispatcherContext,
          asyncContext as AsyncContext,
        );
      }
    };
  }

  /**
   * Merge the event publisher into the provided object.
   * This is required to make `publish` and `publishAll` available on the `IAggregateRoot` class instance.
   * The aggregate is the dispatcher context, unless `commit()`, `publish()` or `publishAll()` is given one.
   * @param object The object to merge into.
   * @param asyncContext The async context (if scoped).
   */
  mergeObjectContext<T extends IAggregateRoot<EventBase>>(
    object: T,
    asyncContext?: AsyncContext,
  ): T {
    const eventBus = this.eventBus;
    object.publish = (event: EventBase, dispatcherContext?: unknown) => {
      return eventBus.publish(
        event,
        dispatcherContext === undefined ? object : dispatcherContext,
        asyncContext as AsyncContext,
      );
    };

    object.publishAll = (events: EventBase[], dispatcherContext?: unknown) => {
      return eventBus.publishAll(
        events,
        dispatcherContext === undefined ? object : dispatcherContext,
        asyncContext as AsyncContext,
      );
    };
    return object;
  }
}
