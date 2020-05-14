import { ICommand } from './command.interface';

export interface ICommandHandler<
  TCommand extends ICommand = any,
  TResult = any
> {
  execute(command: TCommand): Promise<TResult>;
}
