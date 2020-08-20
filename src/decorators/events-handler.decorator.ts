import 'reflect-metadata';
import { IEvent } from '../index';
import { EVENTS_HANDLER_METADATA } from './constants';

/**
 * EventHandler handle dispatched on `EventPublisher`
 * @param events List of `IEvent`
 * @see https://docs.nestjs.com/recipes/cqrs#events
 */
export const EventsHandler = (...events: IEvent[]): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(EVENTS_HANDLER_METADATA, events, target);
  };
};
