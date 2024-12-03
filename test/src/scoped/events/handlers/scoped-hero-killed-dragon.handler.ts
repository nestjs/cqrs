import { Inject, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AsyncContext, EventsHandler, IEventHandler } from '../../../../../src';
import { ScopedHeroKilledDragonEvent } from '../impl/hero-killed-dragon.event';

@EventsHandler(ScopedHeroKilledDragonEvent, {
  scope: Scope.REQUEST,
})
export class ScopedHeroKilledDragonHandler
  implements IEventHandler<ScopedHeroKilledDragonEvent>
{
  constructor(@Inject(REQUEST) public readonly context: AsyncContext) {}

  handle(event: ScopedHeroKilledDragonEvent) {
    Logger.debug('HeroKilledDragonHandler has been called');
  }
}
