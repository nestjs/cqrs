import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '../../../../../src';
import { DragonDiedEvent } from '../impl/dragon-died.event';

@EventsHandler(DragonDiedEvent)
export class DragonDiedHandler implements IEventHandler<DragonDiedEvent> {
  handle(event: DragonDiedEvent) {
    Logger.log('DragonDiedEvent...');
  }
}
