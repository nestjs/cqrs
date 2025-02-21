import { Command } from '../../classes';
import { AsyncContext } from '../../scopes/async.context';
import { ICommand } from './command.interface';

/**
 * Represents a command bus.
 *
 * @publicApi
 */
export interface ICommandBus<CommandBase extends ICommand = ICommand> {
  /**
   * Executes a command.
   * @param command The command to execute.
   * @returns A promise that, when resolved, will contain the result returned by the command's handler.
   */
  execute<R = void>(command: Command<R>): Promise<R>;
  /**
   * Executes a command.
   * @param command The command to execute.
   * @param context The context to use. Optional.
   * @returns A promise that, when resolved, will contain the result returned by the command's handler.
   */
  execute<R = void>(command: Command<R>, context?: AsyncContext): Promise<R>;
  /**
   * Executes a command.
   * @param command The command to execute.
   * @param context The context to use. Optional.
   * @returns A promise that, when resolved, will contain the result returned by the command's handler.
   */
  execute<T extends CommandBase, R = any>(
    command: T,
    context?: AsyncContext,
  ): Promise<R>;
}
