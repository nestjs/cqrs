import { Logger } from '@nestjs/common';
import {
  EventPublisher,
  EventsHandler,
  IEventHandler,
} from '../../../../../src/index.js';
import { HeroKilledDragonEvent } from '../impl/hero-killed-dragon.event.js';
import { EnemyRepository } from '../../repository/enemy.repository.js';
import { Dragon } from '../../models/dragon.model.js';

@EventsHandler(HeroKilledDragonEvent)
export class HeroKilledDragonHandler
  implements IEventHandler<HeroKilledDragonEvent>
{
  constructor(
    private readonly repository: EnemyRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async handle(event: HeroKilledDragonEvent) {
    Logger.debug('HeroKilledDragonHandler has been called');

    const dragon = this.publisher.mergeObjectContext(
      (await this.repository.findOneById(event.dragonId)) as Dragon,
    );
    dragon.die();
    dragon.commit();
  }
}
