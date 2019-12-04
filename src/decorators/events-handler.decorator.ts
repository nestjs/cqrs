import 'reflect-metadata';
import { IEvent } from '../index';
import { EVENTS_HANDLER_METADATA } from './constants';

export const EventsHandler = <EventBase extends IEvent = IEvent>(
  ...events: EventBase[]
): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(EVENTS_HANDLER_METADATA, events, target);
  };
};
