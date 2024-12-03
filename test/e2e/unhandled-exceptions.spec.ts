import { Test, TestingModule } from '@nestjs/testing';
import { take } from 'rxjs';
import { CommandBus, UnhandledExceptionBus } from '../../src';
import { AppModule } from '../src/app.module';
import { UnhandledExceptionCommand } from '../src/errors/commands/unhandled-exception.command';
import { UnhandledExceptionEvent } from '../src/errors/events/unhandled-exception.event';

describe('Unhandled exceptions', () => {
  let moduleRef: TestingModule;
  let unhandledExceptionBus: UnhandledExceptionBus;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await moduleRef.init();

    unhandledExceptionBus = moduleRef.get(UnhandledExceptionBus);
  });

  describe('when exception is thrown from command handler', () => {
    it('should rethrow the exception', async () => {
      const command = new UnhandledExceptionCommand('command');
      const commandBus = moduleRef.get(CommandBus);
      try {
        await commandBus.execute(command);

        expect(true).toBe(false);
      } catch (error) {
        expect(error).toEqual(
          new Error(`Unhandled exception in ${command.failAt}`),
        );
      }
    });
  });

  describe('when exception is thrown from event handler', () => {
    it('should forward exception to UnhandledExceptionBus', (done) => {
      const command = new UnhandledExceptionCommand('event');
      const commandBus = moduleRef.get(CommandBus);

      unhandledExceptionBus.pipe(take(1)).subscribe((exceptionInfo) => {
        expect(exceptionInfo.exception).toEqual(
          new Error(`Unhandled exception in ${command.failAt}`),
        );
        expect(exceptionInfo.cause).toBeInstanceOf(UnhandledExceptionEvent);
        done();
      });
      commandBus.execute(command).catch((err) => done(err));
    });
  });

  describe('when exception is thrown from saga', () => {
    it('should forward exception to UnhandledExceptionBus', (done) => {
      const command = new UnhandledExceptionCommand('saga');
      const commandBus = moduleRef.get(CommandBus);

      unhandledExceptionBus.pipe(take(1)).subscribe((exceptionInfo) => {
        expect(exceptionInfo.exception).toEqual(
          new Error(`Unhandled exception in ${command.failAt}`),
        );
        expect(exceptionInfo.cause).toEqual('onError');
        done();
      });
      commandBus.execute(command).catch((err) => done(err));
    });
  });

  afterAll(async () => {
    await moduleRef.close();
  });
});
