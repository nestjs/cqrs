import { ICommand } from './command.interface';

/**
 * Represents a command handler.
 * Command handlers are used to execute commands.
 */
export interface ICommandHandler<
  TCommand extends ICommand = any,
  TResult = any,
> {
  /**
   * Executes a command.
   * @param command The command to execute.
   */
  execute(command: TCommand): Promise<TResult>;
}
