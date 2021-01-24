import 'reflect-metadata';
import { ICommand, CommandHandlerOptions } from '../interfaces';
import { COMMAND_HANDLER_METADATA, SCOPE_OPTIONS_METADATA } from './constants';

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
export function CommandHandler(command: ICommand): ClassDecorator;

/**
 * Decorator that marks a class as a Nest command handler. A command handler
 * handles commands (actions) executed by your application code.
 *
 * The decorated class must implement the `ICommandHandler` interface.
 *
 * @param options options specifying command *type* to be handled by this handler and scope of handler.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#commands
 */
export function CommandHandler(options: CommandHandlerOptions): ClassDecorator;

/**
 * Decorator that marks a class as a Nest command handler. A command handler
 * handles commands (actions) executed by your application code.
 *
 * The decorated class must implement the `ICommandHandler` interface.
 *
 * @param commandOrOptions command *type* to be handled by this handler or a `CommandHandlerOptions` object.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#commands
 */
export function CommandHandler(
  commandOrOptions: ICommand | CommandHandlerOptions,
): ClassDecorator {
  return (target: object) => {
    if (
      !(commandOrOptions as any)?.prototype &&
      (commandOrOptions as CommandHandlerOptions)?.command
    ) {
      const options: CommandHandlerOptions = commandOrOptions as CommandHandlerOptions;
      Reflect.defineMetadata(COMMAND_HANDLER_METADATA, options.command, target);
      Reflect.defineMetadata(
        SCOPE_OPTIONS_METADATA,
        { scope: options.scope },
        target,
      );
    } else {
      const command: ICommand = commandOrOptions as ICommand;
      Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
    }
  };
}
