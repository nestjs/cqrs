import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '../../../../../src/index.js';
import { waitImmediate } from '../../../../utils/wait-immediate.js';
import { HeroFoundItemEvent } from '../../../heroes/events/impl/hero-found-item.event.js';

@EventsHandler(HeroFoundItemEvent)
export class HeroFoundItemSlowHandler
  implements IEventHandler<HeroFoundItemEvent>
{
  async handle(event: HeroFoundItemEvent) {
    await waitImmediate();
    Logger.log('HeroFoundItemEvent...', event);
    this.end();
  }

  end() {}
}
