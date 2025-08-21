import { EventPublisher } from '../../../../../src';
import { HeroRepository } from '../../repository/hero.repository';
import { DropAncientItemHandler } from './drop-ancient-item.handler';
import { KillDragonHandler } from './kill-dragon.handler';

export const CommandHandlers = [
  KillDragonHandler,
  {
    provide: DropAncientItemHandler,
    inject: [HeroRepository, EventPublisher],
    useFactory: (repository, publisher) =>
      new DropAncientItemHandler(repository, publisher),
  },
];
