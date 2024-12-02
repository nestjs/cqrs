import { EventsHandler, IEventHandler } from '../../../../src';
import { UnhandledExceptionEvent } from './unhandled-exception.event';

@EventsHandler(UnhandledExceptionEvent)
export class UnhandledExceptionEventHandler
  implements IEventHandler<UnhandledExceptionEvent>
{
  async handle(event: UnhandledExceptionEvent) {
    if (event.failAt === 'event') {
      throw new Error(`Unhandled exception in ${event.failAt}`);
    }
  }
}
