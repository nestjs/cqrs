import { Type } from '@nestjs/common';
import { EVENT_METADATA } from '../decorators/constants';
import { EventIdProvider, IEvent } from '../interfaces';

class DefaultEventIdProvider<EventBase extends IEvent = IEvent>
  implements EventIdProvider<EventBase>
{
  getEventId(event: Type<EventBase>): string | null {
    return Reflect.getMetadata(EVENT_METADATA, event)?.id ?? null;
  }
}

export const defaultEventIdProvider = new DefaultEventIdProvider();
