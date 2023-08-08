import { Injectable } from '@nestjs/common';
import { AggregateRoot } from './aggregate-root';
import { EventBus } from './event-bus';
import { IEvent } from './interfaces';

export interface Constructor<T> {
  new (...args: any[]): T;
}

@Injectable()
export class EventPublisher<EventBase extends IEvent = IEvent> {
  constructor(private readonly eventBus: EventBus<EventBase>) {}

  /**
   * Merge the event publisher into the provided class.
   * This is required to make `publish` and `publishAll` available on the `AgreggateRoot` class.
   * @param metatype The class to merge into.
   */
  mergeClassContext<T extends Constructor<AggregateRoot<EventBase>>>(
    metatype: T,
  ): T {
    const eventBus = this.eventBus;
    return class extends metatype {
      publish(event: EventBase) {
        eventBus.publish(event, this);
      }

      publishAll(events: EventBase[]) {
        eventBus.publishAll(events, this);
      }
    };
  }

  /**
   * Merge the event publisher into the provided object.
   * This is required to make `publish` and `publishAll` available on the `AgreggateRoot` class instance.
   * @param object The object to merge into.
   */
  mergeObjectContext<T extends AggregateRoot<EventBase>>(object: T): T {
    const eventBus = this.eventBus;
    object.publish = (event: EventBase) => {
      eventBus.publish(event, object);
    };

    object.publishAll = (events: EventBase[]) => {
      eventBus.publishAll(events, object);
    };
    return object;
  }
}
