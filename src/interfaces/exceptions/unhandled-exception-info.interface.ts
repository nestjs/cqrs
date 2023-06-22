import { ICommand } from '../commands/command.interface';
import { IEvent } from '../events/event.interface';

export interface UnhandledExceptionInfo<
  Cause = IEvent | ICommand,
  Exception = any,
> {
  /**
   * The exception that was thrown.
   */
  exception: Exception;
  /**
   * The cause of the exception.
   */
  cause: Cause;
}
