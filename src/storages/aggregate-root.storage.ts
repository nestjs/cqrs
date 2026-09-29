import { Type } from '@nestjs/common';
import { IAggregateRoot } from '../interfaces/index.js';
import { EventBus } from '../event-bus.js';
import { IEvent } from '../interfaces/index.js';

export class AggregateRootStorage {
  private static storage: Array<Type<IAggregateRoot>> = [];

  static add(type: Type<IAggregateRoot>): void {
    this.storage.push(type);
  }

  static mergeContext(eventBus: EventBus): void {
    for (const item of this.storage) {
      item.prototype.publish = function (
        event: IEvent,
        dispatcherContext?: unknown,
      ) {
        return dispatcherContext === undefined
          ? eventBus.publish(event)
          : eventBus.publish(event, dispatcherContext);
      };

      item.prototype.publishAll = function (
        events: IEvent[],
        dispatcherContext?: unknown,
      ) {
        return dispatcherContext === undefined
          ? eventBus.publishAll(events)
          : eventBus.publishAll(events, dispatcherContext);
      };
    }
    this.storage = [];
  }
}
