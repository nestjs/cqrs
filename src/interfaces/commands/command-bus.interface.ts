import { ICommand, ReturningCommand } from './command.interface';


export interface ICommandBus {
  execute<T extends ICommand, K = T extends ReturningCommand<infer U> ? U : unknown>(command: T): Promise<K>;
}
