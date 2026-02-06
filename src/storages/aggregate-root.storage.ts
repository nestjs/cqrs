import { Type } from '@nestjs/common';
import { IAggregateRoot } from '../interfaces';
import { EventBus } from '../event-bus';
import { IEvent } from '../interfaces';

export class AggregateRootStorage {
  private static storage: Array<Type<IAggregateRoot>> = [];

  static add(type: Type<IAggregateRoot>): void {
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
