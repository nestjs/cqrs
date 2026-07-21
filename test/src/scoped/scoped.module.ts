import { Module } from '@nestjs/common';
import { CommandHandlers } from './commands/handlers/index.js';
import { EventHandlers } from './events/handlers/index.js';
import { QueryHandlers } from './queries/handlers/index.js';
import { HeroRepository } from './repository/hero.repository.js';
import { HeroesGameSagas } from './sagas/heroes.sagas.js';

@Module({
  controllers: [],
  providers: [
    HeroRepository,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
    HeroesGameSagas,
  ],
})
export class ScopedModule {}
