import 'reflect-metadata';
import { ICommand, IEvent } from '../index';
import { EVENTS_HANDLER_METADATA } from './constants';

export const EventsHandler = (...events: IEvent[]): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(EVENTS_HANDLER_METADATA, events, target);
  };
};
