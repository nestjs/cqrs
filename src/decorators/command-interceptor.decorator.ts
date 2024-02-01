import 'reflect-metadata';
import { COMMAND_INTERCEPTOR_METADATA } from './constants';

/**
 * Decorator that marks a class as a Nest command interceptor. A command interceptor
 * intercepts commands (actions) executed by your application code and allows you to implement
 * cross-cutting concerns.
 *
 * The decorated class must implement the `ICommandInterceptor` interface.
 */
export const CommandInterceptor = (): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(COMMAND_INTERCEPTOR_METADATA, {}, target);
  };
};
