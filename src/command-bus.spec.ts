import { InvalidCommandHandlerException } from './exceptions/invalid-command-handler.exception';
import { ModuleRef } from '@nestjs/core';
import { CommandBus } from './command-bus';
import { CommandHandlerNotFoundException } from './exceptions';
import { CommandHandler } from './decorators';
import { Injectable, Scope } from '@nestjs/common';
import { ICommandHandler } from './interfaces';
import { Test } from '@nestjs/testing';

describe('CommandBus', () => {
  let target: CommandBus;
  let moduleRef: ModuleRef;

  beforeEach(() => {
    moduleRef = {} as any;
    target = new CommandBus(moduleRef);
  });

  describe('.execute()', () => {
    let get: jest.SpyInstance;

    beforeEach(() => {
      get = jest.spyOn(target['handlers'], 'get');
    });

    it('should call execute of the obtained handler and return the result', async () => {
      const execute = jest.fn().mockResolvedValue('expected result');
      get.mockResolvedValue({ execute } as any);

      const result = await target.execute('my command');

      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('my command');
      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith('my command');
      expect(result).toBe('expected result');
    });

    it('should throw a CommandHandlerNotFoundException when no handler is found for the informed command', async () => {
      get.mockResolvedValue(undefined);
      let thrownError: any;

      try {
        await target.execute('my command');
      } catch (error) {
        thrownError = error;
      }

      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('my command');
      expect(thrownError).toBeInstanceOf(CommandHandlerNotFoundException);
    });
  });

  describe('.registerHandler()', () => {
    let registerHandler: jest.SpyInstance;

    beforeEach(() => {
      registerHandler = jest
        .spyOn(target['handlers'], 'registerHandler')
        .mockReturnValue(true);
    });

    it('should return with no errors when registerHandler returns true', () => {
      const result = target['registerHandler']('handler type' as any);

      expect(registerHandler).toHaveBeenCalledTimes(1);
      expect(registerHandler).toHaveBeenCalledWith('handler type');
      expect(result).toBeUndefined();
    });

    it('should thrown an InvalidCommandHandlerException when registerHandler returns false', () => {
      registerHandler.mockReturnValue(false);
      let thrownError: any;

      try {
        target['registerHandler']('handler type' as any);
      } catch (error) {
        thrownError = error;
      }

      expect(registerHandler).toHaveBeenCalledTimes(1);
      expect(registerHandler).toHaveBeenCalledWith('handler type');
      expect(thrownError).toBeInstanceOf(InvalidCommandHandlerException);
    });
  });

  describe('request scope handler injections', () => {
    class MyCommand {}
    class MyCommand2 {}
    class MyCommand3 {}

    @Injectable()
    class MySingletonService {
      private salt = Math.random();
      test() {
        return `singleton salt ${this.salt}`;
      }
    }
    @Injectable({ scope: Scope.REQUEST })
    class MyRequestScopeService {
      private salt = Math.random();
      test() {
        return `salt ${this.salt}`;
      }
    }
    @CommandHandler(MyCommand)
    @Injectable({ scope: Scope.REQUEST })
    class MyHandler implements ICommandHandler<MyCommand> {
      constructor(
        private singleton: MySingletonService,
        private requestScope: MyRequestScopeService,
      ) {}
      async execute(command: MyCommand): Promise<any> {
        return [
          command.constructor.name,
          this.singleton.test(),
          this.requestScope.test(),
        ];
      }
    }

    @CommandHandler(MyCommand3)
    class MyThirdWayToCreateAHandler implements ICommandHandler<string> {
      constructor(
        private singleton: MySingletonService,
        private requestScope: MyRequestScopeService,
      ) {}
      async execute(command: MyCommand2): Promise<any> {
        return [
          command.constructor.name,
          this.singleton.test(),
          this.requestScope.test(),
        ];
      }
    }

    @CommandHandler({ command: MyCommand2, scope: Scope.REQUEST })
    class MyOtherWayToCreateAHandler implements ICommandHandler<MyCommand2> {
      constructor(
        private singleton: MySingletonService,
        private requestScope: MyRequestScopeService,
      ) {}
      async execute(command: MyCommand2): Promise<any> {
        return [
          command.constructor.name,
          this.singleton.test(),
          this.requestScope.test(),
        ];
      }
    }

    it('should instantiate two different handlers with two differents request scope service instances but the same singleton service instance', async () => {
      const module = await Test.createTestingModule({
        providers: [
          CommandBus,
          MyOtherWayToCreateAHandler,
          MyHandler,
          MySingletonService,
          MyRequestScopeService,
          {
            provide: MyThirdWayToCreateAHandler,
            useClass: MyThirdWayToCreateAHandler,
            scope: Scope.REQUEST,
          },
        ],
      }).compile();
      const bus = module.get(CommandBus);
      bus.register([
        MyHandler,
        MyOtherWayToCreateAHandler,
        MyThirdWayToCreateAHandler,
      ]);

      const [command1, singleton1, requestScope1] = await bus.execute(
        new MyCommand(),
      );
      const [command2, singleton2, requestScope2] = await bus.execute(
        new MyCommand2(),
      );
      const [command3, singleton3, requestScope3] = await bus.execute(
        new MyCommand3(),
      );

      expect(command1).toBe('MyCommand');
      expect(command2).toBe('MyCommand2');
      expect(command3).toBe('MyCommand3');
      expect(singleton1).toMatch(/^singleton salt .+$/);
      expect(singleton1).toBe(singleton2);
      expect(singleton1).toBe(singleton3);
      expect(requestScope1).toMatch(/^salt .+$/);
      expect(requestScope2).toMatch(/^salt .+$/);
      expect(requestScope3).toMatch(/^salt .+$/);
      expect(requestScope1).not.toBe(requestScope2);
      expect(requestScope1).not.toBe(requestScope3);
      expect(requestScope2).not.toBe(requestScope3);
    });
  });

  describe('singleton scope handler injections', () => {
    class MyCommand {}
    class MyCommand2 {}

    @Injectable()
    class MySingletonService {
      private salt = Math.random();
      test() {
        return `singleton salt ${this.salt}`;
      }
    }

    @CommandHandler(MyCommand)
    class MyHandler implements ICommandHandler<string> {
      private salt = Math.random();
      constructor(private singleton: MySingletonService) {}
      async execute(command: MyCommand): Promise<any> {
        return [command.constructor.name, this.singleton.test(), this.salt];
      }
    }

    @CommandHandler({ command: MyCommand2 })
    class MyOtherWayToCreateAHandler implements ICommandHandler<string> {
      private salt = Math.random();
      constructor(private singleton: MySingletonService) {}
      async execute(command: MyCommand2): Promise<any> {
        return [command.constructor.name, this.singleton.test(), this.salt];
      }
    }

    it('should get the same handler in two different calls for the same handler', async () => {
      const module = await Test.createTestingModule({
        providers: [
          CommandBus,
          MyOtherWayToCreateAHandler,
          MyHandler,
          MySingletonService,
        ],
      }).compile();
      const bus = module.get(CommandBus);
      bus.register([MyHandler, MyOtherWayToCreateAHandler]);

      const [command1_1, singleton1_1, salt1_1] = await bus.execute(
        new MyCommand(),
      );
      const [command1_2, singleton1_2, salt1_2] = await bus.execute(
        new MyCommand(),
      );
      const [command2_1, singleton2_1, salt2_1] = await bus.execute(
        new MyCommand2(),
      );
      const [command2_2, singleton2_2, salt2_2] = await bus.execute(
        new MyCommand2(),
      );

      expect(command1_1).toBe('MyCommand');
      expect(command1_1).toBe(command1_2);
      expect(singleton1_1).toMatch(/^singleton salt .+$/);
      expect(singleton1_1).toBe(singleton1_2);
      expect(salt1_1).toBeDefined();
      expect(salt1_1).toBe(salt1_2);
      expect(command2_1).toBe('MyCommand2');
      expect(command2_1).toBe(command2_2);
      expect(singleton2_1).toMatch(/^singleton salt .+$/);
      expect(singleton2_1).toBe(singleton2_2);
      expect(salt2_1).toBeDefined();
      expect(salt2_1).toBe(salt2_2);
    });
  });
});
