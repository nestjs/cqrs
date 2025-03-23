import { Injectable, InjectableOptions } from '@nestjs/common';
import { randomUUID } from 'crypto';
import 'reflect-metadata';
import { IEvent } from '../index';
import { EVENT_METADATA, EVENTS_HANDLER_METADATA } from './constants';

/**
 * Decorator that marks a class as a Nest event handler. An event handler
 * handles events executed by your application code.
 *
 * The decorated class must implement the `IEventHandler` interface.
 *
 * @param events one or more event *types* to be handled by this handler.
 * @param options injectable options passed on to the "@Injectable" decorator.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#events
 *
 * @publicApi
 */
export const EventsHandler = (
  ...events: (IEvent | (new (...args: any[]) => IEvent) | InjectableOptions)[]
): ClassDecorator => {
  return (target: Function) => {
    const last = events[events.length - 1];
    if (last && typeof last !== 'function' && 'scope' in last) {
      Injectable(last)(target);
      events.pop();
    }

    events.forEach((event) => {
      if (!Reflect.hasOwnMetadata(EVENT_METADATA, event)) {
        Reflect.defineMetadata(EVENT_METADATA, { id: randomUUID() }, event);
      }
    });

    Reflect.defineMetadata(EVENTS_HANDLER_METADATA, events, target);
  };
};
