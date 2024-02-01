import { Test } from '@nestjs/testing';
import {
  CqrsModule,
  CommandBus,
  ICommandHandler,
  ICommand,
  CommandHandler,
  CommandInterceptor,
  ICommandInterceptor,
} from './index';
import { Type } from '@nestjs/common';

class TestCommand implements ICommand {}

@CommandHandler(TestCommand)
class TestCommandHandler implements ICommandHandler {
  execute(): Promise<any> {
    return Promise.resolve(undefined);
  }
}

@CommandInterceptor()
class FirstCommandInterceptor implements ICommandInterceptor {
  intercept(_: unknown, next: () => Promise<unknown>) {
    return next();
  }
}

@CommandInterceptor()
class SecondCommandInterceptor implements ICommandInterceptor {
  intercept(_: unknown, next: () => Promise<unknown>) {
    return next();
  }
}

describe('Command interception', () => {
  const bootstrap = async (
    ...interceptors: Type<ICommandInterceptor>[]
  ): Promise<{
    commandBus: CommandBus;
    commandHandler: TestCommandHandler;
    interceptors: ICommandInterceptor[];
  }> => {
    const moduleRef = await Test.createTestingModule({
      providers: [TestCommandHandler, ...interceptors],
      imports: [CqrsModule],
    }).compile();
    await moduleRef.init();

    return {
      commandBus: moduleRef.get(CommandBus),
      commandHandler: moduleRef.get(TestCommandHandler),
      interceptors: interceptors.map((interceptor) =>
        moduleRef.get(interceptor),
      ),
    };
  };

  it('should invoke command handler', async () => {
    const { commandBus, commandHandler } = await bootstrap(
      FirstCommandInterceptor,
      SecondCommandInterceptor,
    );

    const fakeResult = {};
    const commandExecuteSpy = jest
      .spyOn(commandHandler, 'execute')
      .mockImplementation(() => Promise.resolve(fakeResult));

    const command = new TestCommand();
    const executionResult = await commandBus.execute(command);

    expect(commandExecuteSpy).toHaveBeenCalledWith(command);
    expect(executionResult).toEqual(fakeResult);
  });

  it('should invoke every interceptor', async () => {
    const {
      commandBus,
      interceptors: [firstCommandInterceptor, secondCommandInterceptor],
    } = await bootstrap(FirstCommandInterceptor, SecondCommandInterceptor);

    const firstHandlerInterceptSpy = jest.spyOn(
      firstCommandInterceptor,
      'intercept',
    );
    const secondHandlerInterceptSpy = jest.spyOn(
      secondCommandInterceptor,
      'intercept',
    );

    const command = new TestCommand();
    await commandBus.execute(command);

    expect(firstHandlerInterceptSpy).toHaveBeenCalledWith(
      command,
      expect.anything(),
    );
    expect(secondHandlerInterceptSpy).toHaveBeenCalledWith(
      command,
      expect.anything(),
    );
  });

  it('should allow modification of a command', async () => {
    const {
      commandBus,
      interceptors: [commandInterceptor],
    } = await bootstrap(FirstCommandInterceptor);

    const fakeResult = {};
    jest
      .spyOn(commandInterceptor, 'intercept')
      .mockImplementation(() => Promise.resolve(fakeResult));

    const executionResult = commandBus.execute(new TestCommand());
    await expect(executionResult).resolves.toEqual(fakeResult);
  });

  it('should propagate errors and stop execution', async () => {
    const {
      commandBus,
      interceptors: [firstCommandInterceptor, secondCommandInterceptor],
    } = await bootstrap(FirstCommandInterceptor, SecondCommandInterceptor);

    const fakeError = new Error('FAKE_ERROR');
    jest
      .spyOn(firstCommandInterceptor, 'intercept')
      .mockImplementation(() => Promise.reject(fakeError));
    const secondInterceptorInterceptSpy = jest.spyOn(
      secondCommandInterceptor,
      'intercept',
    );

    await expect(commandBus.execute(new TestCommand())).rejects.toEqual(
      fakeError,
    );
    expect(secondInterceptorInterceptSpy).not.toHaveBeenCalled();
  });
});
