/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Type } from '@nestjs/common';
import type { IEvent, IEventHandler, IAggregateRoot } from '../interfaces';

const INTERNAL_EVENTS = Symbol();
const IS_AUTO_COMMIT_ENABLED = Symbol();

type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

export function WithAggregateRoot<
  EventBase extends IEvent = IEvent,
  TBase extends AbstractConstructor = AbstractConstructor,
>(Base: TBase) {
  abstract class AggregateRoot
    extends Base
    implements IAggregateRoot<EventBase>
  {
    public [IS_AUTO_COMMIT_ENABLED] = false;
    private readonly [INTERNAL_EVENTS]: EventBase[] = [];

    set autoCommit(value: boolean) {
      this[IS_AUTO_COMMIT_ENABLED] = value;
    }

    get autoCommit(): boolean {
      return this[IS_AUTO_COMMIT_ENABLED];
    }

    publish<T extends EventBase = EventBase>(event: T) {}

    publishAll<T extends EventBase = EventBase>(events: T[]) {}

    commit() {
      this.publishAll(this[INTERNAL_EVENTS]);
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

    apply<T extends EventBase = EventBase>(
      event: T,
      isFromHistory?: boolean,
    ): void;
    apply<T extends EventBase = EventBase>(
      event: T,
      options?: { fromHistory?: boolean; skipHandler?: boolean },
    ): void;
    apply<T extends EventBase = EventBase>(
      event: T,
      optionsOrIsFromHistory:
        | boolean
        | { fromHistory?: boolean; skipHandler?: boolean } = {},
    ): void {
      const isFromHistory =
        (typeof optionsOrIsFromHistory === 'boolean'
          ? optionsOrIsFromHistory
          : optionsOrIsFromHistory.fromHistory) ?? false;

      const skipHandler =
        typeof optionsOrIsFromHistory === 'boolean'
          ? false
          : optionsOrIsFromHistory.skipHandler;

      if (!isFromHistory && !this.autoCommit) {
        this[INTERNAL_EVENTS].push(event);
      }

      this.autoCommit && this.publish(event);

      if (!skipHandler) {
        const handler = this.getEventHandler(event);
        handler && handler.call(this, event);
      }
    }

    protected getEventHandler<T extends EventBase = EventBase>(
      event: T,
    ): Type<IEventHandler> | undefined {
      const handler = `on${this.getEventName(event)}`;
      return (this as any)[handler];
    }

    protected getEventName(event: any): string {
      const { constructor } = Object.getPrototypeOf(event);
      return constructor.name as string;
    }
  }
  type FinalAggregateRoot = IAggregateRoot<EventBase> & InstanceType<TBase>;
  return AggregateRoot as unknown as AbstractConstructor<FinalAggregateRoot>;
}
