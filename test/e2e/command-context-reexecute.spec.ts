import { Test, TestingModule } from '@nestjs/testing';
import { AsyncContext, CommandBus } from '../../src/index.js';
import { AppModule } from '../src/app.module.js';
import { HERO_ID } from '../src/heroes/repository/fixtures/user.js';
import { ScopedKillDragonCommand } from '../src/scoped/commands/impl/scoped-kill-dragon.command.js';

describe('Request-scoped command executed again', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await moduleRef.init();
  });

  afterAll(() => moduleRef.close());

  it('runs a command that already carries a context with another one', async () => {
    const commandBus = moduleRef.get(CommandBus);
    const command = new ScopedKillDragonCommand(HERO_ID, 'dragonId');

    await commandBus.execute(command, new AsyncContext());

    await expect(
      commandBus.execute(command, new AsyncContext()),
    ).resolves.toEqual({ heroId: HERO_ID, dragonId: 'dragonId' });
  });
});
