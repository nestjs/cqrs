import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '../../../../../src/index.js';
import { DragonDiedEvent } from '../impl/dragon-died.event.js';

@EventsHandler(DragonDiedEvent)
export class DragonDiedHandler implements IEventHandler<DragonDiedEvent> {
  handle(event: DragonDiedEvent) {
    Logger.log('DragonDiedEvent...');
  }
}
