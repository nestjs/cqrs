import { ICommand } from './command.interface';

export interface ICommandHandler<T extends ICommand = any, K = T extends ICommand<infer U> ? U : never >{
  execute(command: T): Promise<K>;
}