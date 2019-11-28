import { IEvent } from '../interfaces';

export const defaultGetEventName = <EventBase extends IEvent = IEvent>(
  event: EventBase,
): string => {
  const { constructor } = Object.getPrototypeOf(event);
  return constructor.name as string;
};
