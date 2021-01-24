import { IQueryHandler } from './interfaces/queries/query-handler.interface';
import { InvalidQueryHandlerException } from './exceptions/invalid-query-handler.exception';
import { ModuleRef } from '@nestjs/core';
import { QueryBus } from './query-bus';
import { QueryHandlerNotFoundException } from './exceptions';
import { Injectable, Scope } from '@nestjs/common';
import { QueryHandler } from './decorators';
import { Test } from '@nestjs/testing';

describe('QueryBus', () => {
  let target: QueryBus;
  let moduleRef: ModuleRef;

  beforeEach(() => {
    moduleRef = {} as any;
    target = new QueryBus(moduleRef);
  });

  describe('.execute()', () => {
    let get: jest.SpyInstance;

    beforeEach(() => {
      get = jest.spyOn(target['handlers'], 'get');
    });

    it('should call execute of the obtained handler and return the result', async () => {
      const execute = jest.fn().mockResolvedValue('expected result');
      get.mockResolvedValue({ execute } as any);

      const result = await target.execute('my query');

      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('my query');
      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith('my query');
      expect(result).toBe('expected result');
    });

    it('should throw a QueryHandlerNotFoundException when no handler is found for the informed query', async () => {
      get.mockResolvedValue(undefined);
      let thrownError: any;

      try {
        await target.execute('my query');
      } catch (error) {
        thrownError = error;
      }

      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('my query');
      expect(thrownError).toBeInstanceOf(QueryHandlerNotFoundException);
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

    it('should thrown an InvalidQueryHandlerException when registerHandler returns false', () => {
      registerHandler.mockReturnValue(false);
      let thrownError: any;

      try {
        target['registerHandler']('handler type' as any);
      } catch (error) {
        thrownError = error;
      }

      expect(registerHandler).toHaveBeenCalledTimes(1);
      expect(registerHandler).toHaveBeenCalledWith('handler type');
      expect(thrownError).toBeInstanceOf(InvalidQueryHandlerException);
    });
  });

  describe('request scope handler injections', () => {
    class MyQuery {}
    class MyQuery2 {}

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
    @QueryHandler(MyQuery)
    @Injectable({ scope: Scope.REQUEST })
    class MyHandler implements IQueryHandler<string> {
      constructor(
        private singleton: MySingletonService,
        private requestScope: MyRequestScopeService,
      ) {}
      async execute(query: MyQuery): Promise<any> {
        return [
          query.constructor.name,
          this.singleton.test(),
          this.requestScope.test(),
        ];
      }
    }

    @QueryHandler({ query: MyQuery2, scope: Scope.REQUEST })
    class MyOtherWayToCreateAHandler implements IQueryHandler<string> {
      constructor(
        private singleton: MySingletonService,
        private requestScope: MyRequestScopeService,
      ) {}
      async execute(query: MyQuery2): Promise<any> {
        return [
          query.constructor.name,
          this.singleton.test(),
          this.requestScope.test(),
        ];
      }
    }

    it('should instantiate two different handlers with two differents request scope service instances but the same singleton service instance', async () => {
      const module = await Test.createTestingModule({
        providers: [
          QueryBus,
          MyOtherWayToCreateAHandler,
          MyHandler,
          MySingletonService,
          MyRequestScopeService,
        ],
      }).compile();
      const bus = module.get(QueryBus);
      bus.register([MyHandler, MyOtherWayToCreateAHandler]);

      const [query1, singleton1, requestScope1] = await bus.execute(
        new MyQuery(),
      );
      const [query2, singleton2, requestScope2] = await bus.execute(
        new MyQuery2(),
      );

      expect(query1).toBe('MyQuery');
      expect(query2).toBe('MyQuery2');
      expect(singleton1).toMatch(/^singleton salt .+$/);
      expect(singleton1).toBe(singleton2);
      expect(requestScope1).toMatch(/^salt .+$/);
      expect(requestScope2).toMatch(/^salt .+$/);
      expect(requestScope1).not.toBe(requestScope2);
    });
  });

  describe('singleton scope handler injections', () => {
    class MyQuery {}
    class MyQuery2 {}

    @Injectable()
    class MySingletonService {
      private salt = Math.random();
      test() {
        return `singleton salt ${this.salt}`;
      }
    }

    @QueryHandler(MyQuery)
    class MyHandler implements IQueryHandler<MyQuery> {
      private salt = Math.random();
      constructor(private singleton: MySingletonService) {}
      async execute(query: MyQuery): Promise<any> {
        return [query.constructor.name, this.singleton.test(), this.salt];
      }
    }

    @QueryHandler({ query: MyQuery2 })
    class MyOtherWayToCreateAHandler implements IQueryHandler<MyQuery2> {
      private salt = Math.random();
      constructor(private singleton: MySingletonService) {}
      async execute(query: MyQuery2): Promise<any> {
        return [query.constructor.name, this.singleton.test(), this.salt];
      }
    }

    it('should get the same handler in two different calls for the same handler', async () => {
      const module = await Test.createTestingModule({
        providers: [
          QueryBus,
          MyOtherWayToCreateAHandler,
          MyHandler,
          MySingletonService,
        ],
      }).compile();
      const bus = module.get(QueryBus);
      bus.register([MyHandler, MyOtherWayToCreateAHandler]);

      const [query1_1, singleton1_1, salt1_1] = await bus.execute(
        new MyQuery(),
      );
      const [query1_2, singleton1_2, salt1_2] = await bus.execute(
        new MyQuery(),
      );
      const [query2_1, singleton2_1, salt2_1] = await bus.execute(
        new MyQuery2(),
      );
      const [query2_2, singleton2_2, salt2_2] = await bus.execute(
        new MyQuery2(),
      );

      expect(query1_1).toBe('MyQuery');
      expect(query1_1).toBe(query1_2);
      expect(singleton1_1).toMatch(/^singleton salt .+$/);
      expect(singleton1_1).toBe(singleton1_2);
      expect(salt1_1).toBeDefined();
      expect(salt1_1).toBe(salt1_2);
      expect(query2_1).toBe('MyQuery2');
      expect(query2_1).toBe(query2_2);
      expect(singleton2_1).toMatch(/^singleton salt .+$/);
      expect(singleton2_1).toBe(singleton2_2);
      expect(salt2_1).toBeDefined();
      expect(salt2_1).toBe(salt2_2);
    });
  });
});
