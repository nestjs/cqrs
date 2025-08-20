import { Provider } from '@nestjs/common';
import { IQueryHandler } from '../../../../../src';
import { HeroRepository } from '../../repository/hero.repository';
import { GetHeroHandler } from './get-hero.handler';
import { GetHeroesHandler } from './get-heroes.handler';

export const QueryHandlers: Provider<IQueryHandler>[] = [
  GetHeroesHandler,
  {
    provide: GetHeroHandler,
    inject: [HeroRepository],
    useFactory: (repository) => new GetHeroHandler(repository),
  },
];
