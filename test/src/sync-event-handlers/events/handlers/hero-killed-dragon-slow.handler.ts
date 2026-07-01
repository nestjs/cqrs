import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '../../../../../src/index.js';
import { waitImmediate } from '../../../../utils/wait-immediate.js';
import { HeroKilledDragonEvent } from '../../../heroes/events/impl/hero-killed-dragon.event.js';

@EventsHandler(HeroKilledDragonEvent)
export class HeroKilledDragonSlowHandler
  implements IEventHandler<HeroKilledDragonEvent>
{
  async handle(event: HeroKilledDragonEvent) {
    await waitImmediate();
    Logger.log('HeroKilledDragonEvent...', event);
    this.end();
  }

  end() {}
}
