import { EventsHandler, IEventHandler } from '../../../../../src';
import { NoopEvent } from '../impl/noop.event';

@EventsHandler(NoopEvent)
export class NoopHandler implements IEventHandler<NoopEvent> {
  handle(event: NoopEvent) {}
}
