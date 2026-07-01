import { EventPublisher } from '../../../../../src/index.js';
import { HeroRepository } from '../../repository/hero.repository.js';
import { DropAncientItemHandler } from './drop-ancient-item.handler.js';
import { KillDragonHandler } from './kill-dragon.handler.js';

export const CommandHandlers = [
  KillDragonHandler,
  {
    provide: DropAncientItemHandler,
    inject: [HeroRepository, EventPublisher],
    useFactory: (repository, publisher) =>
      new DropAncientItemHandler(repository, publisher),
  },
];
