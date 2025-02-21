import { Command } from '../../classes';
import { ICommand } from './command.interface';

/**
 * Represents a command handler.
 * Command handlers are used to execute commands.
 *
 * @publicApi
 */
export type ICommandHandler<TCommand extends ICommand = any, TResult = any> =
  TCommand extends Command<infer InferredCommandResult>
    ? {
        /**
         * Executes a command.
         * @param command The command to execute.
         */
        execute(command: TCommand): Promise<InferredCommandResult>;
      }
    : {
        /**
         * Executes a command.
         * @param command The command to execute.
         */
        execute(command: TCommand): Promise<TResult>;
      };
