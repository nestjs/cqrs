import { Enemy } from './enemy.model.js';

export abstract class Monster extends Enemy {
  protected abstract roar(): void;
}
