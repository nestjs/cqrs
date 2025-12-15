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

  // generic overrides for the apply method to preserve typings
  getUncommittedEvents(): EventBase[] {
    return super.getUncommittedEvents() as EventBase[];
  }

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
}
