import { Test, TestingModule } from '@nestjs/testing';
import { AsyncContext, EventBus } from '../../src/index.js';
import { AppModule } from '../src/app.module.js';
import { HERO_ID } from '../src/heroes/repository/fixtures/user.js';
import { ScopedHeroKilledDragonEvent } from '../src/scoped/events/impl/hero-killed-dragon.event.js';

describe('Event published again with an async context', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await moduleRef.init();
  });

  afterAll(() => moduleRef.close());

  it('publishes an event that already carries a context with another one', () => {
    const eventBus = moduleRef.get(EventBus);
    const event = new ScopedHeroKilledDragonEvent(HERO_ID, 'dragonId');
    const first = new AsyncContext();

    eventBus.publish(event, first);

    expect(() => eventBus.publish(event, new AsyncContext())).not.toThrow();
    expect(AsyncContext.of(event)).toBe(first);
  });
});
