import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '../../../../../src/index.js';
import { HeroRepository } from '../../repository/hero.repository.js';
import { GetHeroesQuery } from '../impl/index.js';

@QueryHandler(GetHeroesQuery)
export class GetHeroesHandler implements IQueryHandler<GetHeroesQuery> {
  constructor(private readonly repository: HeroRepository) {}

  async execute(query: GetHeroesQuery) {
    Logger.debug('GetHeroesQuery has been called');
    return this.repository.findAll();
  }
}
