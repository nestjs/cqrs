import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
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

describe('Generics', () => {
  let commandBus!: CommandBus;
  let queryBus!: QueryBus;

  describe('Commands', () => {
    describe('when "Command" utility class is used', () => {
      it('should infer return type', () => {
        const command = new Command<string>();

        expectTypeOf(commandBus.execute(command)).resolves.toBeString();
      });
    });

    describe('when any other class is used', () => {
      it('should fallback to any return type', () => {
        class MyCommand {}

        const command = new MyCommand();

        expectTypeOf(commandBus.execute(command)).resolves.toBeAny();
      });

      it('should use the 2nd generic parameter as return type', () => {
        class MyCommand {}

        const command = new MyCommand();

        expectTypeOf(
          commandBus.execute<MyCommand, string>(command),
        ).resolves.toBeString();
      });
    });
  });

  describe('Queries', () => {
    describe('when "Query" utility class is used', () => {
      it('should infer return type', () => {
        const query = new Query<string>();

        expectTypeOf(queryBus.execute(query)).resolves.toBeString();
      });
    });

    describe('when any other class is used', () => {
      it('should fallback to any return type', () => {
        class MyQuery {}

        const query = new MyQuery();

        expectTypeOf(queryBus.execute(query)).resolves.toBeAny();
      });

      it('should use the 2nd generic parameter as return type', () => {
        class MyQuery {}

        const query = new MyQuery();

        expectTypeOf(
          queryBus.execute<MyQuery, string>(query),
        ).resolves.toBeString();
      });
    });
  });

  describe('Command handlers', () => {
    it('should infer return type', () => {
      class MyCommand extends Command<{
        value: string;
      }> {}

      class ValidHandler implements ICommandHandler<MyCommand> {
        execute(): Promise<{ value: string }> {
          throw new Error('Method not implemented.');
        }
      }

      class InvalidHandler implements ICommandHandler<MyCommand> {
        // @ts-expect-error Expected return type is { value: string }
        execute(): Promise<{ value: number }> {
          throw new Error('Method not implemented.');
        }
      }

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

      expectTypeOf(commandBus.execute(new MyCommand())).resolves.toEqualTypeOf<{
        value: string;
      }>();
    });
  });

  describe('Query handlers', () => {
    it('should infer return type', () => {
      class MyQuery extends Query<{
        value: string;
      }> {}

      class ValidHandler implements IQueryHandler<MyQuery> {
        execute(): Promise<{ value: string }> {
          throw new Error('Method not implemented.');
        }
      }

      class InvalidHandler implements IQueryHandler<MyQuery> {
        // @ts-expect-error Expected return type is { value: string }
        execute(): Promise<{ value: number }> {
          throw new Error('Method not implemented.');
        }
      }

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

      expectTypeOf(queryBus.execute(new MyQuery())).resolves.toEqualTypeOf<{
        value: string;
      }>();
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

      let eventBus!: EventBus<CustomEvent>;

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
        // @ts-expect-error publishAll requires a CustomEvent
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
      let eventBus!: EventBus;

      it('publish method should return any', () => {
        expectTypeOf(eventBus.publish({ id: 'test' })).toBeAny();
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

      let eventBus!: EventBus<IEvent, Publisher>;

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

      let eventBus!: EventBus<IEvent, Publisher>;

      it('publish method should return string', () => {
        const result = eventBus.publish({ id: 'test' });

        expectTypeOf(result).toBeString();
      });

      it('publishAll method should fall back to an array of publish results', () => {
        const result = eventBus.publishAll([{ id: 'test' }]);

        expectTypeOf(result).toBeArray();
        expectTypeOf(result).items.toBeString();
      });
    });
  });
});
