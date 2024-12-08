import 'reflect-metadata';
import { ICommand } from '../index';
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from './constants';

/**
 * Decorator that marks a class as a Nest command handler. A command handler
 * handles commands (actions) executed by your application code.
 *
 * The decorated class must implement the `ICommandHandler` interface.
 *
 * @param command command *type* to be handled by this handler.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#commands
 */
export const CommandHandler = (
  command: ICommand | (new (...args: any[]) => ICommand),
): ClassDecorator => {
  return (target: object) => {
    if (!Reflect.hasOwnMetadata(COMMAND_METADATA, command)) {
      Reflect.defineMetadata(COMMAND_METADATA, { id: crypto.randomUUID() }, command);
    }
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
  };
};
