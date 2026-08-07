import { AggregateRoot } from '../../../../src/index.js';
import { HeroFoundItemEvent } from '../events/impl/hero-found-item.event.js';
import { HeroKilledDragonEvent } from '../events/impl/hero-killed-dragon.event.js';

export class Hero extends AggregateRoot {
  constructor(private readonly id: string) {
    super();
  }

  killEnemy(enemyId: string) {
    // logic
    this.apply(new HeroKilledDragonEvent(this.id, enemyId));
  }

  addItem(itemId: string) {
    // logic
    this.apply(new HeroFoundItemEvent(this.id, itemId));
  }
}
