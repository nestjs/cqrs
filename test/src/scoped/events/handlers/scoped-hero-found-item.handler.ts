import { Inject, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AsyncContext, EventsHandler, IEventHandler } from '../../../../../src';
import { ScopedHeroFoundItemEvent } from '../impl/hero-found-item.event';

@EventsHandler(ScopedHeroFoundItemEvent, {
  scope: Scope.REQUEST,
})
export class ScopedHeroFoundItemHandler
  implements IEventHandler<ScopedHeroFoundItemEvent>
{
  constructor(@Inject(REQUEST) public readonly context: AsyncContext) {}

  handle(event: ScopedHeroFoundItemEvent) {
    Logger.log('HeroFoundItemEvent...');
  }
}
