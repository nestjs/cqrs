import { Inject, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  AsyncContext,
  CommandHandler,
  EventPublisher,
  ICommandHandler,
} from '../../../../../src';
import { HeroRepository } from '../../repository/hero.repository';
import { ScopedKillDragonCommand } from '../impl/scoped-kill-dragon.command';

@CommandHandler(ScopedKillDragonCommand, {
  scope: Scope.REQUEST,
})
export class ScopedKillDragonHandler
  implements ICommandHandler<ScopedKillDragonCommand>
{
  constructor(
    private readonly repository: HeroRepository,
    private readonly publisher: EventPublisher,
    @Inject(REQUEST) public readonly context: AsyncContext,
  ) {}

  async execute(command: ScopedKillDragonCommand) {
    Logger.debug('KillDragonHandler has been called');

    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
      this.context,
    );
    hero.killEnemy(dragonId);
    hero.commit();

    return { heroId, dragonId };
  }
}
