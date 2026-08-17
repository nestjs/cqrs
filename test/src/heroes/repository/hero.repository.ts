import { Injectable } from '@nestjs/common';
import { Hero } from '../models/hero.model.js';
import { userHero } from './fixtures/user.js';

@Injectable()
export class HeroRepository {
  async findOneById(id: number): Promise<Hero> {
    return userHero;
  }

  async findAll(): Promise<Hero[]> {
    return [userHero];
  }
}
