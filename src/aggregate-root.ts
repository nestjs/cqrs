import { IEvent } from './interfaces/index';

export abstract class AggregateRoot {
    private readonly changes: IEvent[] = [];
    publish(event: IEvent) {}

    uncommitChanges() {
        this.changes.length = 0;
    }

    getUncommittedChanges(): IEvent[] {
        return this.changes;
    }

    loadFromHistory(history: IEvent[]) {
        history.forEach((event) => this.apply(event, true));
    }

    apply(event: IEvent, isFromHistory = false) {
        if (!isFromHistory) {
            this.changes.push(event);
        }
        this.publish(event);

        const handler = this.getEventHandler(event);
        handler && handler(event);
    }

    private getEventHandler(event: IEvent) {
        const handler = `on${this.getEventName(event)}`;
        return this[handler];
    }

    private getEventName(event): string {
        const { constructor } = Object.getPrototypeOf(event);
        return constructor.name as string;
    }
}