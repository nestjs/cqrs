import { EventsHandler, IEventHandler } from '../../../../../src/index.js';
import { NoopEvent } from '../impl/noop.event.js';

@EventsHandler(NoopEvent)
export class NoopHandler implements IEventHandler<NoopEvent> {
  handle(event: NoopEvent) {}
}
