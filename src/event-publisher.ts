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
      publish(pattern: string, event: EventBase) {
        eventBus.publish(pattern, event);
      }
      publishLocally(event: EventBase) {
        eventBus.publishLocally(event);
      }
    };
  }

  mergeObjectContext<T extends AggregateRoot<EventBase>>(object: T): T {
    const eventBus = this.eventBus;
    object.publish = (pattern: string, event: EventBase) => {
      eventBus.publish(pattern, event);
    };
    object.publishLocally = (event: EventBase) => {
      eventBus.publishLocally(event);
    };
    return object;
  }
}
