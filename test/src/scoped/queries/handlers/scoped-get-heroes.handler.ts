import { Inject, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AsyncContext, IQueryHandler, QueryHandler } from '../../../../../src';
import { HeroRepository } from '../../repository/hero.repository';
import { ScopedGetHeroesQuery } from '../impl';

@QueryHandler(ScopedGetHeroesQuery, {
  scope: Scope.REQUEST,
})
export class ScopedGetHeroesHandler
  implements IQueryHandler<ScopedGetHeroesQuery>
{
  constructor(
    private readonly repository: HeroRepository,
    @Inject(REQUEST) public readonly context: AsyncContext,
  ) {}

  async execute(query: ScopedGetHeroesQuery) {
    Logger.debug('GetHeroesQuery has been called');
    return this.repository.findAll();
  }
}
