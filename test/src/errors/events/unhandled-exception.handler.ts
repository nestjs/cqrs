import { EventsHandler, IEventHandler } from '../../../../src/index.js';
import { UnhandledExceptionEvent } from './unhandled-exception.event.js';

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
