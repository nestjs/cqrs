import { Inject, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  AsyncContext,
  CommandHandler,
  EventPublisher,
  ICommandHandler,
} from '../../../../../src';
import { HeroRepository } from '../../repository/hero.repository';
import { ScopedDropAncientItemCommand } from '../impl/scoped-drop-ancient-item.command';

@CommandHandler(ScopedDropAncientItemCommand, {
  scope: Scope.REQUEST,
})
export class ScopedDropAncientItemHandler
  implements ICommandHandler<ScopedDropAncientItemCommand>
{
  constructor(
    private readonly repository: HeroRepository,
    private readonly publisher: EventPublisher,
    @Inject(REQUEST) public readonly context: AsyncContext,
  ) {}

  async execute(command: ScopedDropAncientItemCommand) {
    Logger.debug('DropAncientItemHandler has been called');

    const { heroId, itemId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
      this.context,
    );
    hero.addItem(itemId);
    hero.commit();
  }
}
