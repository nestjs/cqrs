import { Test, TestingModule } from '@nestjs/testing';
import { setTimeout } from 'timers/promises';
import { CommandBus, QueryBus } from '../../src';
import { AppModule } from '../src/app.module';
import { DropAncientItemHandler } from '../src/heroes/commands/handlers/drop-ancient-item.handler';
import { KillDragonHandler } from '../src/heroes/commands/handlers/kill-dragon.handler';
import { DropAncientItemCommand } from '../src/heroes/commands/impl/drop-ancient-item.command';
import { KillDragonCommand } from '../src/heroes/commands/impl/kill-dragon.command';
import { HeroFoundItemHandler } from '../src/heroes/events/handlers/hero-found-item.handler';
import { HeroKilledDragonHandler } from '../src/heroes/events/handlers/hero-killed-dragon.handler';
import { HeroFoundItemEvent } from '../src/heroes/events/impl/hero-found-item.event';
import { HeroKilledDragonEvent } from '../src/heroes/events/impl/hero-killed-dragon.event';
import { GetHeroesQuery } from '../src/heroes/queries/impl';
import { HERO_ID } from '../src/heroes/repository/fixtures/user';
import { ANCIENT_ITEM_ID } from '../src/heroes/sagas/heroes.sagas';
import { NoopHandler } from '../src/noop/events/handlers/noop.handler';
import { waitImmediate } from '../utils/wait-immediate';

describe('Basic flows', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await moduleRef.init();
  });

  describe('when "KillDragonCommand" command is dispatched', () => {
    let killDragonExecuteSpy: jest.SpyInstance;
    let heroKilledDragonHandleSpy: jest.SpyInstance;
    let noopEventHandleSpy: jest.SpyInstance;
    let command: KillDragonCommand;

    beforeAll(async () => {
      const killDragonHandler = moduleRef.get(KillDragonHandler);
      const heroKilledDragonHandler = moduleRef.get(HeroKilledDragonHandler);
      const noopHandler = moduleRef.get(NoopHandler);

      killDragonExecuteSpy = jest.spyOn(killDragonHandler, 'execute');
      heroKilledDragonHandleSpy = jest.spyOn(heroKilledDragonHandler, 'handle');
      noopEventHandleSpy = jest.spyOn(noopHandler, 'handle');

      const commandBus = moduleRef.get(CommandBus);
      const heroId = HERO_ID;
      const dragonId = 'dragonId';

      command = new KillDragonCommand(heroId, dragonId);
      await commandBus.execute(command);
      await waitImmediate();
    });

    it('should execute command handler', () => {
      expect(killDragonExecuteSpy).toHaveBeenCalledWith(command);
    });

    it('should handle "HeroKillDragonEvent" event', () => {
      const event = new HeroKilledDragonEvent(command.heroId, command.dragonId);
      expect(heroKilledDragonHandleSpy).toHaveBeenCalledWith(event);
    });

    it('should not trigger "NoopHandler" event', () => {
      expect(noopEventHandleSpy).not.toHaveBeenCalled();
    });

    describe('when saga triggered', () => {
      let dropAncientExecuteSpy: jest.SpyInstance;
      let heroFoundItemSpy: jest.SpyInstance;

      beforeAll(async () => {
        const dropAncientItemHandler = moduleRef.get(DropAncientItemHandler);
        const heroFoundItemHandler = moduleRef.get(HeroFoundItemHandler);
        dropAncientExecuteSpy = jest.spyOn(dropAncientItemHandler, 'execute');
        heroFoundItemSpy = jest.spyOn(heroFoundItemHandler, 'handle');

        // Wait 1 second for saga to be triggered
        await setTimeout(1000);
      });

      it('should dispatch "DropAncientItemCommand" and execute its command handler', () => {
        expect(dropAncientExecuteSpy).toHaveBeenCalledWith(
          new DropAncientItemCommand(HERO_ID, ANCIENT_ITEM_ID),
        );
      });

      it('should handle "HeroFoundItemEvent" event', () => {
        expect(heroFoundItemSpy).toHaveBeenCalledWith(
          new HeroFoundItemEvent(HERO_ID, ANCIENT_ITEM_ID),
        );
      });
    });
  });

  describe('when "GetHeroesQuery" query is executed', () => {
    it('should return all heroes', async () => {
      const queryBus = moduleRef.get(QueryBus);
      const heroes = await queryBus.execute(new GetHeroesQuery());
      expect(heroes).toEqual([expect.objectContaining({ id: HERO_ID })]);
    });
  });

  afterAll(async () => {
    await moduleRef.close();
  });
});
