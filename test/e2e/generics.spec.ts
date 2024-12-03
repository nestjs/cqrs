import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Command,
  CommandBus,
  ICommandHandler,
  Query,
  QueryBus,
} from '../../src';
import { AppModule } from '../src/app.module';

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
            value as string;

            // @ts-expect-error
            value as number;
          });
        } catch (err) {
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
            value as string;
            value as number;
          });
        } catch (err) {
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
            value as string;

            // @ts-expect-error
            value as number;
          });
        } catch (err) {
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
            value as string;

            // @ts-expect-error
            value as number;
          });
        } catch (err) {
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
            value as string;
            value as number;
          });
        } catch (err) {
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
            value as string;

            // @ts-expect-error
            value as number;
          });
        } catch (err) {
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
        execute(command: Test): Promise<{ value: string }> {
          throw new Error('Method not implemented.');
        }
      }

      class InvalidHandler implements ICommandHandler<Test> {
        // @ts-expect-error
        execute(command: Test): Promise<{ value: number }> {
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
          value.value as string;

          // @ts-expect-error
          value as number;
        });
      } catch (err) {
        // Do nothing
      } finally {
        expect(true).toBeTruthy();
      }
    });
  });

  afterAll(async () => {
    await moduleRef.close();
  });
});
