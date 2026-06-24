import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '../../../../../src/index.js';
import { HeroFoundItemEvent } from '../impl/hero-found-item.event.js';

@EventsHandler(HeroFoundItemEvent)
export class HeroFoundItemHandler implements IEventHandler<HeroFoundItemEvent> {
  handle(event: HeroFoundItemEvent) {
    Logger.log('HeroFoundItemEvent...');
  }
}
