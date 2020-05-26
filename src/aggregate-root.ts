/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { IEvent } from './interfaces';

const INTERNAL_EVENTS = Symbol();
const IS_AUTO_COMMIT_ENABLED = Symbol();
const PUBLISH_PATTERN = Symbol();

export abstract class AggregateRoot<EventBase extends IEvent = IEvent> {
  public [IS_AUTO_COMMIT_ENABLED] = false;
  public [PUBLISH_PATTERN] = null;
  private readonly [INTERNAL_EVENTS]: EventBase[] = [];

  set autoCommit(value: boolean) {
    this[IS_AUTO_COMMIT_ENABLED] = value;
  }

  get autoCommit(): boolean {
    return this[IS_AUTO_COMMIT_ENABLED];
  }

  get pattern(): string {
    return this[PUBLISH_PATTERN];
  }

  set pattern(pattern: string) {
    this[PUBLISH_PATTERN] = pattern;
  }

  publish<T extends EventBase = EventBase>(pattern: string, event: T) {}

  publishLocally<T extends EventBase = EventBase>(event: T) {}

  commit() {
    this[INTERNAL_EVENTS].forEach((event) => {
      if (this.pattern) {
        this.publish(this.pattern, event);
      } else {
        this.publishLocally(event);
      }
    });
    this[INTERNAL_EVENTS].length = 0;
  }

  uncommit() {
    this[INTERNAL_EVENTS].length = 0;
  }

  getUncommittedEvents(): EventBase[] {
    return this[INTERNAL_EVENTS];
  }

  loadFromHistory(history: EventBase[]) {
    history.forEach((event) => this.apply(event, true));
  }

  apply<T extends EventBase = EventBase>(event: T, isFromHistory = false) {
    if (!isFromHistory && !this.autoCommit) {
      this[INTERNAL_EVENTS].push(event);
    }
    if (this.pattern) {
      this.autoCommit && this.publish(this.pattern, event);
    } else {
      this.autoCommit && this.publishLocally(event);
    }

    const handler = this.getEventHandler(event);
    handler && handler.call(this, event);
  }

  private getEventHandler<T extends EventBase = EventBase>(
    event: T,
  ): Function | undefined {
    const handler = `on${this.getEventName(event)}`;
    return this[handler];
  }

  protected getEventName(event: any): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }
}
