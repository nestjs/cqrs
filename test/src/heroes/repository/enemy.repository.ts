import { Injectable } from '@nestjs/common';
import { Enemy } from '../models/enemy.model';
import { dragonMonster } from './fixtures/dragon';

@Injectable()
export class EnemyRepository {
  async findOneById(id: string): Promise<Enemy> {
    return dragonMonster;
  }

  async findAll(): Promise<Enemy[]> {
    return [dragonMonster];
  }
}
