import 'reflect-metadata';
import { IEvent, EventHandlerOptions } from '../interfaces';
import { EVENTS_HANDLER_METADATA, SCOPE_OPTIONS_METADATA } from './constants';

/**
 * Decorator that marks a class as a Nest event handler. An event handler
 * handles events executed by your application code.
 *
 * The decorated class must implement the `IEventHandler` interface.
 *
 * @param {object} options configuration object specifying:
 *
 * - `events` - one or more event *types* to be handled by this handler.
 * - `scope` - symbol that determines the lifetime of a handler instance.
 * [See Scope](https://docs.nestjs.com/fundamentals/injection-scopes#usage) for
 * more details.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#events
 */
export function EventsHandler(options: EventHandlerOptions): ClassDecorator;

/**
 * Decorator that marks a class as a Nest event handler. An event handler
 * handles events executed by your application code.
 *
 * The decorated class must implement the `IEventHandler` interface.
 *
 * @param events one or more event *types* to be handled by this handler.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#events
 */
export function EventsHandler(...events: IEvent[]): ClassDecorator;

/**
 * Decorator that marks a class as a Nest event handler. An event handler
 * handles events executed by your application code.
 *
 * The decorated class must implement the `IEventHandler` interface.
 *
 * @param eventsOrOptions one or more event *types* or a `EventHandlerOptions` object.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#events
 */
export function EventsHandler(...eventsOrOptions: any[]): ClassDecorator {
  return (target: object) => {
    if (!eventsOrOptions?.[0].prototype && eventsOrOptions?.[0]?.events) {
      const options: EventHandlerOptions = eventsOrOptions.shift();
      Reflect.defineMetadata(EVENTS_HANDLER_METADATA, options.events, target);
      Reflect.defineMetadata(
        SCOPE_OPTIONS_METADATA,
        { scope: options.scope },
        target,
      );
    } else {
      const events: IEvent[] = eventsOrOptions;
      Reflect.defineMetadata(EVENTS_HANDLER_METADATA, events, target);
    }
  };
}
