import { AggregateRoot } from '../../../../src';
import { ScopedHeroFoundItemEvent } from '../events/impl/hero-found-item.event';
import { ScopedHeroKilledDragonEvent } from '../events/impl/hero-killed-dragon.event';

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
