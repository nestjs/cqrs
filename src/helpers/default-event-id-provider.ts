import { EVENT_METADATA } from '../decorators/constants';
import { EventIdProvider, IEvent } from '../interfaces';

class DefaultEventIdProvider<EventBase extends IEvent = IEvent>
  implements EventIdProvider<EventBase>
{
  getEventId(event: EventBase): string | null {
    return Reflect.getMetadata(EVENT_METADATA, event)?.id ?? null;
  }
}

export const defaultEventIdProvider = new DefaultEventIdProvider();
