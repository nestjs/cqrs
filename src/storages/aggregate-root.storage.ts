import { Type } from '@nestjs/common';
import { AggregateRoot } from '../aggregate-root';
import { EventBus } from '../event-bus';
import { IEvent } from '../interfaces';

export class AggregateRootStorage {
  private static storage: Array<Type<AggregateRoot>> = [];

  static add(type: Type<AggregateRoot>): void {
    this.storage.push(type);
  }

  static mergeContext(eventBus: EventBus): void {
    for (const item of this.storage) {
      item.prototype.publish = function (event: IEvent) {
        eventBus.publish(event);
      };

      item.prototype.publishAll = function (events: IEvent[]) {
        eventBus.publishAll(events);
      };
    }
    this.storage = [];
  }
}
