import { Test, TestingModule } from '@nestjs/testing';
import { AsyncHandlersAppModule } from '../src/sync-event-handlers/async-handlers-app.module';
import { EventBus } from '../../src/event-bus';
import { HeroKilledDragon2SlowHandler } from '../src/sync-event-handlers/events/handlers/hero-killed-dragon2-slow.handler';
import { HeroKilledDragonSlowHandler } from '../src/sync-event-handlers/events/handlers/hero-killed-dragon-slow.handler';
import { HeroFoundItemSlowHandler } from '../src/sync-event-handlers/events/handlers/hero-found-item-slow.handler';
import { SyncHandlersAppModule } from '../src/sync-event-handlers/sync-handlers-app.module';
import { HeroFoundItemEvent } from '../src/heroes/events/impl/hero-found-item.event';
import { HeroKilledDragonEvent } from '../src/heroes/events/impl/hero-killed-dragon.event';

describe('Sync event handlers', () => {
  let moduleRef: TestingModule;
  let eventBus: EventBus;
  let heroFoundItemHandler: HeroFoundItemSlowHandler;
  let heroFoundItemEnded: jest.SpyInstance;
  let heroKilledDragonHandler: HeroKilledDragonSlowHandler;
  let heroKilledDragonEnded: jest.SpyInstance;
  let heroKilledDragon2Handler: HeroKilledDragon2SlowHandler;
  let heroKilledDragon2Ended: jest.SpyInstance;

  beforeEach(() => {
    heroFoundItemEnded.mockClear();
    heroKilledDragonEnded.mockClear();
    heroKilledDragon2Ended.mockClear();
  });

  describe('when event handlers are fully asynchronous', () => {
    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [AsyncHandlersAppModule],
      }).compile();

      await moduleRef.init();
      eventBus = moduleRef.get(EventBus);
      heroFoundItemHandler = moduleRef.get(HeroFoundItemSlowHandler);
      heroKilledDragonHandler = moduleRef.get(HeroKilledDragonSlowHandler);
      heroKilledDragon2Handler = moduleRef.get(HeroKilledDragon2SlowHandler);
      heroFoundItemEnded = jest.spyOn(heroFoundItemHandler, 'end');
      heroKilledDragonEnded = jest.spyOn(heroKilledDragonHandler, 'end');
      heroKilledDragon2Ended = jest.spyOn(heroKilledDragon2Handler, 'end');
    });

    describe('when "HeroFoundItemEvent" event is published', () => {
      it('should wait for the event handlers to complete', async () => {
        const event = new HeroFoundItemEvent('hero1', 'item1');

        await eventBus.publish(event);

        expect(heroFoundItemEnded).not.toHaveBeenCalled();
        expect(heroKilledDragonEnded).not.toHaveBeenCalled();
        expect(heroKilledDragon2Ended).not.toHaveBeenCalled();
      });
    });

    describe('when "HeroKilledDragonEvent" event is published', () => {
      it('should wait for the event handlers to complete', async () => {
        const event = new HeroKilledDragonEvent('hero1', 'dragon1');

        await eventBus.publish(event);

        expect(heroFoundItemEnded).not.toHaveBeenCalled();
        expect(heroKilledDragonEnded).not.toHaveBeenCalled();
        expect(heroKilledDragon2Ended).not.toHaveBeenCalled();
      });
    });
  });

  describe('when event handlers are synchronous', () => {
    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [SyncHandlersAppModule],
      }).compile();

      await moduleRef.init();
      eventBus = moduleRef.get(EventBus);
      heroFoundItemHandler = moduleRef.get(HeroFoundItemSlowHandler);
      heroKilledDragonHandler = moduleRef.get(HeroKilledDragonSlowHandler);
      heroKilledDragon2Handler = moduleRef.get(HeroKilledDragon2SlowHandler);
      heroFoundItemEnded = jest.spyOn(heroFoundItemHandler, 'end');
      heroKilledDragonEnded = jest.spyOn(heroKilledDragonHandler, 'end');
      heroKilledDragon2Ended = jest.spyOn(heroKilledDragon2Handler, 'end');
    });

    describe('when "HeroFoundItemEvent" event is published', () => {
      it('should wait for the event handlers to complete', async () => {
        const event = new HeroFoundItemEvent('hero1', 'item1');

        await eventBus.publish(event);

        expect(heroFoundItemEnded).toHaveBeenCalledTimes(1);
        expect(heroKilledDragonEnded).not.toHaveBeenCalled();
        expect(heroKilledDragon2Ended).not.toHaveBeenCalled();
      });
    });

    describe('when "HeroKilledDragonEvent" event is published', () => {
      it('should wait for the event handlers to complete', async () => {
        const event = new HeroKilledDragonEvent('hero1', 'dragon1');

        await eventBus.publish(event);

        expect(heroFoundItemEnded).not.toHaveBeenCalled();
        expect(heroKilledDragonEnded).toHaveBeenCalledTimes(1);
        expect(heroKilledDragon2Ended).toHaveBeenCalledTimes(1);
      });
    });

    describe('when an unknown event is published', () => {
      it('should return directly', async () => {
        await eventBus.publish({ id: 'unknown event' });

        expect(heroFoundItemEnded).not.toHaveBeenCalled();
        expect(heroKilledDragonEnded).not.toHaveBeenCalled();
        expect(heroKilledDragon2Ended).not.toHaveBeenCalled();
      });
    });
  });

  afterAll(async () => {
    await moduleRef.close();
  });
});
