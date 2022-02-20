import { IEvent } from '../interfaces';
import { EVENT_METADATA } from '../decorators/constants';
import { Type } from '@nestjs/common';

/**
 * Null if the published class is not connected to any handler
 * @param event 
 * @returns 
 */
export const defaultGetEventId = <EventBase extends IEvent = IEvent>(
  event: EventBase,
): string => {
  const { constructor } = Object.getPrototypeOf(event);
  return Reflect.getMetadata(EVENT_METADATA, constructor)?.id ?? null;
};

export const defaultReflectEventId = <
  EventBase extends Type<IEvent> = Type<IEvent>,
>(
  event: EventBase,
): string => {
  return Reflect.getMetadata(EVENT_METADATA, event).id;
};