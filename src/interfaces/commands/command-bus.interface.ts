import { ICommand } from './command.interface';

/**
 * Represents a command bus.
 */
export interface ICommandBus<CommandBase extends ICommand<TResponse> = ICommand, TResponse = any> {
  /**
   * Executes a command.
   * @param command The command to execute.
   */
  execute<T extends CommandBase>(command: T): Promise<TResponse>;
}
