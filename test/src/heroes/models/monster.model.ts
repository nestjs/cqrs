import { Enemy } from './enemy.model';

export abstract class Monster extends Enemy {
  protected abstract roar(): void;
}
