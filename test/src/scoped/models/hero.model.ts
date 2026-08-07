import { AggregateRoot } from '../../../../src/index.js';
import { ScopedHeroFoundItemEvent } from '../events/impl/hero-found-item.event.js';
import { ScopedHeroKilledDragonEvent } from '../events/impl/hero-killed-dragon.event.js';

export class Hero extends AggregateRoot {
  constructor(private readonly id: string) {
    super();
  }

  killEnemy(enemyId: string) {
    // logic
    this.apply(new ScopedHeroKilledDragonEvent(this.id, enemyId));
  }

  addItem(itemId: string) {
    // logic
    this.apply(new ScopedHeroFoundItemEvent(this.id, itemId));
  }
}
