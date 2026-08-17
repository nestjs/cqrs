import { Logger } from '@nestjs/common';
import { WithAggregateRoot } from '../../../../src/mixins/with-aggregate-root.mixin.js';
import { Monster } from './monster.model.js';
import { DragonDiedEvent } from '../events/impl/dragon-died.event.js';

export class Dragon extends WithAggregateRoot(Monster) {
  roar(): void {
    Logger.log('Roarrrr!');
  }
  die(): void {
    this.roar();
    this.apply(new DragonDiedEvent(this.id));
  }
}
