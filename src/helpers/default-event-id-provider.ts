import { IEvent } from '../interfaces';
import { EVENT_METADATA } from '../decorators/constants';
import { Type } from '@nestjs/common';
import { EventIdProvider } from '../interfaces';

class DefaultEventIdProvider<EventBase extends IEvent = IEvent>
  implements EventIdProvider<EventBase>
{
  getEventId(event: EventBase): string | null {
    const { constructor } = Object.getPrototypeOf(event);

    return this.reflectEventId(constructor);
  }

  reflectEventId(event: Type<EventBase>): string | null {
    return Reflect.getMetadata(EVENT_METADATA, event)?.id ?? null;
  }
}

export const defaultEventIdProvider = new DefaultEventIdProvider();
