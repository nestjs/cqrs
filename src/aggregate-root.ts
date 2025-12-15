import { Type } from '@nestjs/common';
import { IEvent, IEventHandler } from './interfaces';
import { WithAggregateRoot } from './mixins';

/**
 * Represents an aggregate root.
 * An aggregate root is an entity that represents a meaningful concept in the domain.
 * It is the root of an aggregate, which is a cluster of domain objects that can be treated as a single unit.
 *
 * @template EventBase The base type of the events.
 */
export abstract class AggregateRoot<
  EventBase extends IEvent = IEvent,
> extends WithAggregateRoot(class {})<EventBase> {
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
}
