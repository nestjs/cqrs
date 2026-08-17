import { HeroRepository } from '../../repository/hero.repository.js';
import { GetHeroHandler } from './get-hero.handler.js';
import { GetHeroesHandler } from './get-heroes.handler.js';

export const QueryHandlers = [
  GetHeroesHandler,
  {
    provide: GetHeroHandler,
    inject: [HeroRepository],
    useFactory: (repository) => new GetHeroHandler(repository),
  },
];
