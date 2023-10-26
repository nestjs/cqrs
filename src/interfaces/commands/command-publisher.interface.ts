import { ICommand } from './command.interface';

export interface ICommandPublisher<CommandBase extends ICommand<TResponse> = ICommand, TResponse = any> {
  publish<T extends CommandBase = CommandBase>(command: T): TResponse;
}
