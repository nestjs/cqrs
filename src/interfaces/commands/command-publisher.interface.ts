import { ICommand } from './command.interface.js';

/**
 * Represents a command publisher.
 *
 * @publicApi
 */
export interface ICommandPublisher<CommandBase extends ICommand = ICommand> {
  publish<T extends CommandBase = CommandBase>(command: T): any;
}
