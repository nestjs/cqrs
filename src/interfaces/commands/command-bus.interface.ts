import { ICommand } from './command.interface';

export interface ICommandBus<CommandBase extends ICommand = ICommand> {
  execute<T extends CommandBase>(pattern: string, command: T): Promise<any>;
  executeLocally<T extends CommandBase>(command: T): Promise<any>;
}
