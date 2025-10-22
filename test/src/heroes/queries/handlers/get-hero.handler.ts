import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '../../../../../src';
import { HeroRepository } from '../../repository/hero.repository';
import { GetHeroQuery } from '../impl';

@QueryHandler(GetHeroQuery)
export class GetHeroHandler implements IQueryHandler<GetHeroQuery> {
  constructor(private readonly repository: HeroRepository) {}

  async execute(query: GetHeroQuery) {
    Logger.debug('GetHeroQuery has been called');
    return this.repository.findOneById(query.id);
  }
}
