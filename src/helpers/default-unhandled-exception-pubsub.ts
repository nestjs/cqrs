import { Subject } from 'rxjs';
import {
  ICommand,
  IEvent,
  IUnhandledExceptionPublisher,
  UnhandledExceptionInfo,
} from '../interfaces';

/**
 * Default implementation of the `IUnhandledExceptionPublisher` interface.
 */
export class DefaultUnhandledExceptionPubSub<Cause = IEvent | ICommand>
  implements IUnhandledExceptionPublisher<Cause>
{
  constructor(private subject$: Subject<UnhandledExceptionInfo<Cause>>) {}

  publish(info: UnhandledExceptionInfo<Cause>) {
    this.subject$.next(info);
  }
}
