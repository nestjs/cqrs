import { ICommand, ReturningCommand } from './command.interface';

export interface ICommandBus<CommandBase extends ICommand = ICommand> {
  execute<
    T extends CommandBase,
    K = T extends ReturningCommand<infer U> ? U : void
  >(
    command: T,
  ): Promise<K>;
}
