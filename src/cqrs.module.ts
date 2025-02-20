import {
  DynamicModule,
  Module,
  OnApplicationBootstrap,
  Provider,
} from '@nestjs/common';
import { CommandBus } from './command-bus';
import { CQRS_MODULE_OPTIONS } from './constants';
import { EventBus } from './event-bus';
import { EventPublisher } from './event-publisher';
import {
  CqrsModuleAsyncOptions,
  CqrsModuleOptions,
  CqrsModuleOptionsFactory,
  IEvent,
} from './interfaces';
import { QueryBus } from './query-bus';
import { ExplorerService } from './services/explorer.service';
import { UnhandledExceptionBus } from './unhandled-exception-bus';
import { AggregateRootStorage } from './storages/aggregate-root.storage';

/**
 * @publicApi
 */
@Module({
  providers: [
    CommandBus,
    QueryBus,
    EventBus,
    UnhandledExceptionBus,
    EventPublisher,
    ExplorerService,
  ],
  exports: [
    CommandBus,
    QueryBus,
    EventBus,
    UnhandledExceptionBus,
    EventPublisher,
  ],
})
export class CqrsModule<EventBase extends IEvent = IEvent>
  implements OnApplicationBootstrap
{
  static forRoot(options?: CqrsModuleOptions): DynamicModule {
    return {
      module: CqrsModule,
      providers: [
        {
          provide: CQRS_MODULE_OPTIONS,
          useValue: options ?? {},
        },
      ],
      global: true,
    };
  }

  static forRootAsync(options: CqrsModuleAsyncOptions): DynamicModule {
    return {
      module: CqrsModule,
      global: true,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options)],
      exports: [CQRS_MODULE_OPTIONS],
    };
  }

  private static createAsyncProviders(
    options: CqrsModuleAsyncOptions,
  ): Provider[] {
    if (options.useValue) {
      return [
        {
          provide: CQRS_MODULE_OPTIONS,
          useValue: options.useValue,
        },
      ];
    }

    if (options.useFactory) {
      return [
        {
          provide: CQRS_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
        {
          provide: CQRS_MODULE_OPTIONS,
          useFactory: async (optionsFactory: CqrsModuleOptionsFactory) =>
            optionsFactory.createCqrsOptions(),
          inject: [options.useClass],
        },
      ];
    }

    if (options.useExisting) {
      return [
        {
          provide: CQRS_MODULE_OPTIONS,
          useFactory: async (optionsFactory: CqrsModuleOptionsFactory) =>
            optionsFactory.createCqrsOptions(),
          inject: [options.useExisting],
        },
      ];
    }

    throw new Error(
      'Invalid CqrsModuleAsyncOptions configuration. Provide useValue, useFactory, useClass, or useExisting.',
    );
  }

  constructor(
    private readonly explorerService: ExplorerService<EventBase>,
    private readonly eventBus: EventBus<EventBase>,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  onApplicationBootstrap() {
    const { events, queries, sagas, commands } = this.explorerService.explore();

    this.eventBus.register(events);
    this.commandBus.register(commands);
    this.queryBus.register(queries);
    this.eventBus.registerSagas(sagas);

    AggregateRootStorage.mergeContext(this.eventBus);
  }
}
