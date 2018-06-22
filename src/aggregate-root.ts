import { IEvent } from './interfaces/index';

export abstract class AggregateRoot {
  private readonly events: IEvent[] = [];
  public autoCommit = false;

  publish(event: IEvent) {}

  commit() {
    this.events.forEach((event) => this.publish(event));
    this.events.length = 0;
  }

  uncommit() {
    this.events.length = 0;
  }

  getUncommittedEvents(): IEvent[] {
    return this.events;
  }

  loadFromHistory(history: IEvent[]) {
    history.forEach(event => this.apply(event, true));
  }

  apply(event: IEvent, isFromHistory = false) {
    if (!isFromHistory && !this.autoCommit) {
      this.events.push(event);
    }
    this.autoCommit && this.publish(event);

    const handler = this.getEventHandler(event);
    handler && handler.call(this, event);
  }

  private getEventHandler(event: IEvent): Function | undefined {
    const handler = `on${this.getEventName(event)}`;
    return this[handler];
  }

  private getEventName(event): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }
}
