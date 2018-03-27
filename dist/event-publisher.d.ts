import { EventBus } from './event-bus';
import { AggregateRoot } from './aggregate-root';
export interface Constructor<T> {
    new (...args: any[]): T;
}
export declare class EventPublisher {
    private readonly eventBus;
    constructor(eventBus: EventBus);
    mergeClassContext<T extends Constructor<AggregateRoot>>(metatype: T): T;
    mergeObjectContext<T extends AggregateRoot>(object: T): T;
}
