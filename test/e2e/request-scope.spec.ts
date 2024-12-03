import { Test, TestingModule } from '@nestjs/testing';
import { setTimeout } from 'timers/promises';
import { AsyncContext, CommandBus, QueryBus } from '../../src';
import { AppModule } from '../src/app.module';
import { HERO_ID } from '../src/heroes/repository/fixtures/user';
import { ANCIENT_ITEM_ID } from '../src/heroes/sagas/heroes.sagas';
import { ScopedDropAncientItemHandler } from '../src/scoped/commands/handlers/scoped-drop-ancient-item.handler';
import { ScopedKillDragonHandler } from '../src/scoped/commands/handlers/scoped-kill-dragon.handler';
import { ScopedDropAncientItemCommand } from '../src/scoped/commands/impl/scoped-drop-ancient-item.command';
import { ScopedKillDragonCommand } from '../src/scoped/commands/impl/scoped-kill-dragon.command';
import { ScopedHeroFoundItemHandler } from '../src/scoped/events/handlers/scoped-hero-found-item.handler';
import { ScopedHeroKilledDragonHandler } from '../src/scoped/events/handlers/scoped-hero-killed-dragon.handler';
import { ScopedHeroFoundItemEvent } from '../src/scoped/events/impl/hero-found-item.event';
import { ScopedHeroKilledDragonEvent } from '../src/scoped/events/impl/hero-killed-dragon.event';
import { ScopedGetHeroesQuery } from '../src/scoped/queries/impl';
import { waitImmediate } from '../utils/wait-immediate';

describe('Request scope', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await moduleRef.init();
  });

  describe('when "ScopedKillDragonCommand" command is dispatched', () => {
    const asyncContext = new AsyncContext();

    let killDragonExecuteSpy: jest.SpyInstance;
    let heroKilledDragonHandleSpy: jest.SpyInstance;
    let command: ScopedKillDragonCommand;

    beforeAll(async () => {
      moduleRef.registerRequestByContextId(asyncContext, asyncContext.id);

      const killDragonHandler = await moduleRef.resolve(
        ScopedKillDragonHandler,
        asyncContext.id,
      );
      const heroKilledDragonHandler = await moduleRef.resolve(
        ScopedHeroKilledDragonHandler,
        asyncContext.id,
      );

      killDragonExecuteSpy = jest.spyOn(killDragonHandler, 'execute');
      heroKilledDragonHandleSpy = jest.spyOn(heroKilledDragonHandler, 'handle');

      const commandBus = moduleRef.get(CommandBus);
      const heroId = HERO_ID;
      const dragonId = 'dragonId';

      command = new ScopedKillDragonCommand(heroId, dragonId);
      await commandBus.execute(command, asyncContext);
      await waitImmediate();
    });

    it('should execute command handler', () => {
      expect(killDragonExecuteSpy).toHaveBeenCalledWith(command);
    });

    it('should handle "ScopedHeroKilledDragonEvent" event', () => {
      const event = new ScopedHeroKilledDragonEvent(
        command.heroId,
        command.dragonId,
      );
      expect(heroKilledDragonHandleSpy).toHaveBeenCalledWith(event);
    });

    describe('when saga triggered', () => {
      let dropAncientExecuteSpy: jest.SpyInstance;
      let heroFoundItemSpy: jest.SpyInstance;

      beforeAll(async () => {
        const dropAncientItemHandler = await moduleRef.resolve(
          ScopedDropAncientItemHandler,
          asyncContext.id,
        );
        const heroFoundItemHandler = await moduleRef.resolve(
          ScopedHeroFoundItemHandler,
          asyncContext.id,
        );
        dropAncientExecuteSpy = jest.spyOn(dropAncientItemHandler, 'execute');
        heroFoundItemSpy = jest.spyOn(heroFoundItemHandler, 'handle');

        // Wait 1 second for saga to be triggered
        await setTimeout(1000);
      });

      it('should dispatch "ScopedDropAncientItemCommand" and execute its command handler', () => {
        expect(dropAncientExecuteSpy).toHaveBeenCalledWith(
          new ScopedDropAncientItemCommand(HERO_ID, ANCIENT_ITEM_ID),
        );
      });

      it('should handle "ScopedHeroFoundItemEvent" event', () => {
        expect(heroFoundItemSpy).toHaveBeenCalledWith(
          new ScopedHeroFoundItemEvent(HERO_ID, ANCIENT_ITEM_ID),
        );
      });
    });
  });

  describe('when "ScopedKillDragonCommand" command is dispatched and no async context is provided', () => {
    const heroId = HERO_ID;
    const dragonId = 'dragonId';
    const command = new ScopedKillDragonCommand(heroId, dragonId);

    it('should generate a unique async context', async () => {
      const commandBus = moduleRef.get(CommandBus);
      const result = await commandBus.execute(command);
      expect(result).toEqual({ heroId, dragonId });
    });
  });

  describe('when "ScopedGetHeroesQuery" query is executed', () => {
    it('should return all heroes', async () => {
      const asyncContext = new AsyncContext();
      const queryBus = moduleRef.get(QueryBus);
      const heroes = await queryBus.execute(
        new ScopedGetHeroesQuery(),
        asyncContext,
      );
      expect(heroes).toEqual([expect.objectContaining({ id: HERO_ID })]);
    });
  });

  describe('when "ScopedGetHeroesQuery" query is executed and no async context is provided', () => {
    it('should return all heroes', async () => {
      const queryBus = moduleRef.get(QueryBus);
      const heroes = await queryBus.execute(new ScopedGetHeroesQuery());
      expect(heroes).toEqual([expect.objectContaining({ id: HERO_ID })]);
    });
  });

  afterAll(async () => {
    await moduleRef.close();
  });
});
