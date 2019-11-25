import { ICommand, ReturningCommand } from './command.interface';

export interface ICommandHandler<
  T extends ICommand = any,
  K = T extends ReturningCommand<infer U> ? U : void
> {
  execute(command: T): Promise<K>;
}
