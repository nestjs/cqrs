import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Command,
  CommandBus,
  EventBus,
  ICommandHandler,
  IEvent,
  IEventPublisher,
  IQueryHandler,
  Query,
  QueryBus,
} from '../../src';
import { AppModule } from '../src/app.module';
import { expectTypeOf } from 'expect-type';

describe('Generics', () => {
  let moduleRef: TestingModule;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await moduleRef.init();

    commandBus = moduleRef.get(CommandBus);
    queryBus = moduleRef.get(QueryBus);
  });

  describe('Commands', () => {
    describe('when "Command" utility class is used', () => {
      it('should infer return type', async () => {
        const command = new Command<string>();

        try {
          await commandBus.execute(command).then((value) => {
            expectTypeOf(value).toBeString();
          });
        } catch {
          // Do nothing
        } finally {
          expect(true).toBeTruthy();
        }
      });
    });

    describe('when any other class is used', () => {
      it('should fallback to any return type', async () => {
        class MyCommand {}

        const command = new MyCommand();

        try {
          await commandBus.execute(command).then((value) => {
            expectTypeOf(value).toBeAny();
          });
        } catch {
          // Do nothing
        } finally {
          expect(true).toBeTruthy();
        }
      });

      it('should use the 2nd generic parameter as return type', async () => {
        class MyCommand {}

        const command = new MyCommand();

        try {
          await commandBus.execute<MyCommand, string>(command).then((value) => {
            expectTypeOf(value).toBeString();
          });
        } catch {
          // Do nothing
        } finally {
          expect(true).toBeTruthy();
        }
      });
    });
  });

  describe('Queries', () => {
    describe('when "Query" utility class is used', () => {
      it('should infer return type', async () => {
        const query = new Query<string>();

        try {
          await queryBus.execute(query).then((value) => {
            expectTypeOf(value).toBeString();
          });
        } catch {
          // Do nothing
        } finally {
          expect(true).toBeTruthy();
        }
      });
    });

    describe('when any other class is used', () => {
      it('should fallback to any return type', async () => {
        class MyQuery {}

        const query = new MyQuery();

        try {
          await queryBus.execute(query).then((value) => {
            expectTypeOf(value).toBeAny();
          });
        } catch {
          // Do nothing
        } finally {
          expect(true).toBeTruthy();
        }
      });

      it('should use the 2nd generic parameter as return type', async () => {
        class MyQuery {}

        const query = new MyQuery();

        try {
          await queryBus.execute<MyQuery, string>(query).then((value) => {
            expectTypeOf(value).toBeString();
          });
        } catch {
          // Do nothing
        } finally {
          expect(true).toBeTruthy();
        }
      });
    });
  });

  describe('Command handlers', () => {
    it('should infer return type', async () => {
      class Test extends Command<{
        value: string;
      }> {}

      class ValidHandler implements ICommandHandler<Test> {
        execute(): Promise<{ value: string }> {
          throw new Error('Method not implemented.');
        }
      }

      class InvalidHandler implements ICommandHandler<Test> {
        // @ts-expect-error Expected return type is string
        execute(): Promise<{ value: number }> {
          throw new Error('Method not implemented.');
        }
      }

      try {
        commandBus.bind(
          new InstanceWrapper({
            metatype: ValidHandler,
            instance: new ValidHandler(),
          }),
          'Test',
        );
        commandBus.bind(
          new InstanceWrapper({
            metatype: InvalidHandler,
            instance: new InvalidHandler() as any,
          }),
          'Test2',
        );

        await commandBus.execute(new Test()).then((value) => {
          expectTypeOf(value).toEqualTypeOf<{ value: string }>();
        });
      } catch {
        // Do nothing
      } finally {
        expect(true).toBeTruthy();
      }
    });
  });

  describe('Query handlers', () => {
    it('should infer return type', async () => {
      class Test extends Query<{
        value: string;
      }> {}

      class ValidHandler implements IQueryHandler<Test> {
        execute(): Promise<{ value: string }> {
          throw new Error('Method not implemented.');
        }
      }

      class InvalidHandler implements IQueryHandler<Test> {
        // @ts-expect-error Expected return type is string
        execute(): Promise<{ value: number }> {
          throw new Error('Method not implemented.');
        }
      }

      try {
        queryBus.bind(
          new InstanceWrapper({
            metatype: ValidHandler,
            instance: new ValidHandler(),
          }),
          'Test',
        );
        queryBus.bind(
          new InstanceWrapper({
            metatype: InvalidHandler,
            instance: new InvalidHandler() as any,
          }),
          'Test2',
        );

        await queryBus.execute(new Test()).then((value) => {
          expectTypeOf(value).toEqualTypeOf<{ value: string }>();
        });
      } catch {
        // Do nothing
      } finally {
        expect(true).toBeTruthy();
      }
    });
  });

  describe('EventBus', () => {
    describe('when custom event type is passed', () => {
      class CustomEvent {
        constructor(readonly foo: string) {}
      }

      class ExtendedCustomEvent extends CustomEvent {
        constructor(
          foo: string,
          readonly bar: string,
        ) {
          super(foo);
        }
      }

      let eventBus: EventBus<CustomEvent>;

      beforeAll(() => {
        eventBus = moduleRef.get(EventBus);
      });

      it('publish method should forbid other objects than CustomEvent', () => {
        // @ts-expect-error publish requires a CustomEvent
        eventBus.publish({ id: 'test' });
      });

      it('publish method should accept CustomEvent', () => {
        eventBus.publish(new CustomEvent('foo'));
      });

      it('publish method should accept CustomEvent extensions', () => {
        eventBus.publish(new ExtendedCustomEvent('foo', 'bar'));
      });

      it('publishAll method should forbid other objects than CustomEvent', () => {
        // @ts-expect-error publish requires a CustomEvent
        eventBus.publishAll([{ id: 'test' }]);
      });

      it('publishAll method should accept CustomEvent', () => {
        eventBus.publishAll([new CustomEvent('foo')]);
      });

      it('publishAll method should accept CustomEvent extensions', () => {
        eventBus.publishAll([new ExtendedCustomEvent('foo', 'bar')]);
      });
    });

    describe('when default event publisher is used', () => {
      let eventBus: EventBus;

      beforeAll(() => {
        eventBus = moduleRef.get(EventBus);
      });

      it('publish method should return any', () => {
        const result = eventBus.publish({ id: 'test' });

        expectTypeOf(result).toBeAny();
      });

      it('publishAll method should return array of any', () => {
        const result = eventBus.publishAll([{ id: 'test' }]);

        expectTypeOf(result).toBeArray();
        expectTypeOf(result).items.toBeAny();
      });
    });

    describe('when a custom event publisher is used', () => {
      class Publisher implements IEventPublisher {
        publish() {
          return 'any string here';
        }
        publishAll() {
          return true;
        }
      }

      let eventBus: EventBus<IEvent, Publisher>;

      beforeAll(() => {
        eventBus = moduleRef.get(EventBus);
      });

      it('publish method should return string', () => {
        const result = eventBus.publish({ id: 'test' });

        expectTypeOf(result).toBeString();
      });

      it('publishAll method should return boolean', () => {
        const result = eventBus.publishAll([{ id: 'test' }]);

        expectTypeOf(result).toBeBoolean();
      });
    });

    describe('when a custom event publisher is used, but does not implement publishAll', () => {
      class Publisher implements IEventPublisher {
        publish() {
          return 'any string here';
        }
      }

      let eventBus: EventBus<IEvent, Publisher>;

      beforeAll(() => {
        eventBus = moduleRef.get(EventBus);
      });

      it('publish method should return string', () => {
        const result = eventBus.publish({ id: 'test' });

        expectTypeOf(result).toBeString();
      });

      it('publishAll method should return boolean', () => {
        const result = eventBus.publishAll([{ id: 'test' }]);

        expectTypeOf(result).toBeArray();
        expectTypeOf(result).items.toBeString();
      });
    });
  });

  afterAll(async () => {
    await moduleRef.close();
  });
});
