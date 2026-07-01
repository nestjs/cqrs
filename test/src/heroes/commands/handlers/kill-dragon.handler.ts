import { Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventPublisher,
  ICommandHandler,
} from '../../../../../src/index.js';
import { HeroRepository } from '../../repository/hero.repository.js';
import { KillDragonCommand } from '../impl/kill-dragon.command.js';

@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    private readonly repository: HeroRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: KillDragonCommand) {
    Logger.debug('KillDragonHandler has been called');

    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
    );
    hero.killEnemy(dragonId);
    hero.commit();
  }
}
