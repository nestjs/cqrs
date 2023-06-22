import { ICommand } from '../commands/command.interface';
import { IEvent } from '../events/event.interface';

/**
 * Represents an unhandled exception.
 */
export interface UnhandledExceptionInfo<
  Cause = IEvent | ICommand,
  Exception = any,
> {
  /**
   * The exception that was thrown.
   */
  exception: Exception;
  /**
   * The cause of the exception (event or command reference).
   */
  cause: Cause;
}
