import { Type } from '@nestjs/common';
import { IAggregateRoot, IEvent, IEventHandler } from './interfaces';
import { WithAggregateRoot } from './mixins/with-aggregate-root.mixin';

// Dummy abstract class used as a base for AggregateRoot (since TypeScript does not allow direct mixin application with abstract classes).
abstract class AbstractBase {}

/**
 * Represents an aggregate root.
 * An aggregate root is an entity that represents a meaningful concept in the domain.
 * It is the root of an aggregate, which is a cluster of domain objects that can be treated as a single unit.
 *
 * @template EventBase The base type of the events.
 */
export abstract class AggregateRoot<EventBase extends IEvent = IEvent>
  extends WithAggregateRoot(AbstractBase)
  implements IAggregateRoot<EventBase>
{
  // redeclaring protected methods to preserve typings (since this typescript version does not support the "declare" modifier on overrides)
  protected getEventHandler<T extends EventBase = EventBase>(
    event: T,
  ): Type<IEventHandler> | undefined {
    return super['getEventHandler' as unknown as keyof typeof AggregateRoot](
      event,
    );
  }

  protected getEventName(event: any): string {
    return super['getEventName' as unknown as keyof typeof AggregateRoot](
      event,
    );
  }

  // Override the generic methods to make sure the EventBase type is preserved

  /**
   * Returns all uncommitted events.
   * @returns All uncommitted events.
   */
  getUncommittedEvents(): EventBase[] {
    return super.getUncommittedEvents() as EventBase[];
  }

  /**
   * Loads aggregate root state from event history.
   * @param history The event history to load.
   */
  loadFromHistory(history: EventBase[]): void {
    super.loadFromHistory(history);
  }

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
    isFromHistory?: boolean,
  ): void;
  apply<T extends EventBase = EventBase>(
    event: T,
    options?: { fromHistory?: boolean; skipHandler?: boolean },
  ): void;
  apply(event: unknown, options?: unknown): void {
    return super.apply(event as IEvent, options as any);
  }

  /**
   * Publishes a single event.
   * @param event The event to publish.
   */
  publish<T extends EventBase = EventBase>(event: T): void;
  publish<T extends EventBase = EventBase>(event: T): void;
  publish<T extends EventBase = EventBase>(event: T): void {
    super.publish(event);
  }

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   */
  publishAll<T extends EventBase = EventBase>(events: T[]): void;
  publishAll<T extends EventBase = EventBase>(events: T[]): void;
  publishAll<T extends EventBase = EventBase>(events: T[]): void {
    super.publishAll(events);
  }
}
