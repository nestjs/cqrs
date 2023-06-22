import { ICommand } from './command.interface';

/**
 * Represents a command bus.
 */
export interface ICommandBus<CommandBase extends ICommand = ICommand> {
  /**
   * Executes a command.
   * @param command The command to execute.
   */
  execute<T extends CommandBase, R = any>(command: T): Promise<R>;
}
