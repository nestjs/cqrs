import { Logger } from '@nestjs/common';
import { WithAggregateRoot } from '../../../../src/mixins/with-aggregate-root.mixin';
import { Monster } from './monster.model';
import { DragonDiedEvent } from '../events/impl/dragon-died.event';

export class Dragon extends WithAggregateRoot(Monster) {
  roar(): void {
    Logger.log('Roarrrr!');
  }
  die(): void {
    this.roar();
    this.apply(new DragonDiedEvent(this.id));
  }
}
