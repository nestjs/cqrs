import { Command } from './command';
import { ICommand } from './command.interface';

/**
 * Represents a command handler.
 * Command handlers are used to execute commands.
 */
export type ICommandHandler<
  CommandType extends ICommand = any,
  TRes = any,
> = CommandType extends Command<infer ResultType>
  ? BaseICommandHandler<CommandType, ResultType>
  : BaseICommandHandler<CommandType, TRes>;

/**
 * Basic interface for CommandHandlers
 * Can be used for both: inferred and declared return types
 */
interface BaseICommandHandler<TCommand extends ICommand = any, TResult = any> {
  /**
   * Executes a command.
   * @param command The command to execute.
   */
  execute(command: TCommand): Promise<TResult>;
}
