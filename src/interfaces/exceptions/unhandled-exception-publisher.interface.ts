import { ICommand } from '../commands/command.interface.js';
import { IEvent } from '../events/event.interface.js';
import { UnhandledExceptionInfo } from './unhandled-exception-info.interface.js';

export interface IUnhandledExceptionPublisher<
  CauseBase = IEvent | ICommand,
  ExceptionBase = any,
> {
  /**
   * Publishes an unhandled exception.
   * @param info The exception information.
   */
  publish(info: UnhandledExceptionInfo<CauseBase, ExceptionBase>): any;
}
