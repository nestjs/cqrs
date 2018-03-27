import { IEvent } from './interfaces/index';
export declare abstract class AggregateRoot {
    private readonly events;
    autoCommit: boolean;
    publish(event: IEvent): void;
    commit(): void;
    uncommit(): void;
    getUncommittedEvents(): IEvent[];
    loadFromHistory(history: IEvent[]): void;
    apply(event: IEvent, isFromHistory?: boolean): void;
    private getEventHandler(event);
    private getEventName(event);
}
