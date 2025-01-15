import { Type } from '@nestjs/common';
import { IEvent } from './event.interface';

export interface EventIdProvider<EventBase extends IEvent = IEvent> {
  /**
   * Retrieves the unique identifier for the given event instance.
   * Returns null if the event is not associated with any handler.
   *
   * @param event - The event type for which to retrieve the ID.
   * @returns The unique identifier for the event, or null if not connected to any handler.
   */
  getEventId(event: Type<EventBase>): string | null;
}
