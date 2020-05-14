import { ICommand } from './command.interface';

export interface ICommandPublisher<CommandBase extends ICommand = ICommand> {
  publish<T extends CommandBase = CommandBase>(command: T): any;
}
