import { ICommand } from './command.interface';

export interface ICommandHandler<T extends ICommand = any> {
  execute(command: T): Promise<any>;
}
