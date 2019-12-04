import { Type } from '@nestjs/common';
import { EVENT_METADATA } from '../decorators/constants';
import { IEvent } from '../interfaces';

export const defaultGetEventName = <EventBase extends IEvent = IEvent>(
  event: EventBase,
): string => {
  return (
    Reflect.getMetadata(EVENT_METADATA, Object.getPrototypeOf(event)) ||
    Object.getPrototypeOf(event).constructor.name
  );
};

export const defaultGetEventNameFromType = <EventBase extends IEvent = IEvent>(
  eventType: Type<EventBase>,
): string => {
  return Reflect.getMetadata(EVENT_METADATA, eventType) || eventType.name;
};
