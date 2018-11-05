import { ICommand } from './command.interface';

export interface ICommandHandler<T extends ICommand> {
  execute(command: T): any | Promise<any>;
}
