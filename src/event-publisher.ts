import { Injectable } from '@nestjs/common';
import { EventBus } from './event-bus';
import { AggregateRoot } from './aggregate-root';
import { IEvent } from './interfaces';

export interface Constructor<T> {
  new (...args: any[]): T;
}

@Injectable()
export class EventPublisher<EventBase extends IEvent = IEvent> {
  constructor(private readonly eventBus: EventBus<EventBase>) {}

  mergeClassContext<T extends Constructor<AggregateRoot<EventBase>>>(
    metatype: T,
  ): T {
    const eventBus = this.eventBus;
    return class extends metatype {
      publish(event: EventBase) {
        eventBus.publish(event);
      }

      publishAll(events: EventBase[]) {
        eventBus.publishAll(events);
      }
    };
  }

  mergeObjectContext<T extends AggregateRoot<EventBase>>(object: T): T {
    const eventBus = this.eventBus;
    object.publish = (event: EventBase) => {
      eventBus.publish(event);
    };

    object.publishAll = (events: EventBase[]) => {
      eventBus.publishAll(events);
    };
    return object;
  }
}
