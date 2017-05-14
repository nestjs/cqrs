import { Component } from '@nestjs/common';
import { EventBus } from './event-bus';
import { AggregateRoot } from './aggregate-root';
import { IEvent } from './interfaces/index';

export interface Constructor<T> {
    new(...args: any[]): T;
}

@Component()
export class EventPublisher {
    constructor(private readonly eventBus: EventBus) {}

    mergeContext<T extends Constructor<AggregateRoot>>(metatype: T): T {
        const eventBus = this.eventBus;
        return class extends metatype {
            publish(event: IEvent) {
                eventBus.publish(event);
            }
        };
    }

    mergeObjectContext<T extends AggregateRoot>(object: T): T {
        const eventBus = this.eventBus;
        object.publish = (event: IEvent) => {
            eventBus.publish(event);
        };
        return object;
    }
}