import { Scope } from '@nestjs/common';
import { ICommand } from './command.interface';

export interface CommandHandlerOptions {
  /**
   * command *type* to be handled by this handler.
   */
  command: ICommand;

  /**
   * Specifies the lifetime of a handler.
   */
  scope?: Scope;
}

export interface ICommandHandler<
  TCommand extends ICommand = any,
  TResult = any
> {
  execute(command: TCommand): Promise<TResult>;
}
