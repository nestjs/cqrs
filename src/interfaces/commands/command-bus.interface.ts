import { ICommand } from './command.interface';

export interface ICommandBus<CommandBase extends ICommand = ICommand> {
  execute<T extends CommandBase, R = any>(command: T): Promise<R>;
}
