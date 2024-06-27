import { IEvent } from './event.interface';
import { Type } from '@nestjs/common';

export interface EventIdProvider<EventBase extends IEvent = IEvent> {
  /**
   * Null if the published class is not connected to any handler
   */
  getEventId(event: EventBase): string | null;
  reflectEventId(event: Type<EventBase>): string | null;
}
