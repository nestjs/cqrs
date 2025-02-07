import { DynamicModule, Module, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus } from './command-bus';
import { CQRS_MODULE_OPTIONS } from './constants';
import { EventBus } from './event-bus';
import { EventPublisher } from './event-publisher';
import {
  CqrsModuleAsyncOptions,
  CqrsModuleOptions,
  IEvent,
} from './interfaces';
import { QueryBus } from './query-bus';
import { ExplorerService } from './services/explorer.service';
import { UnhandledExceptionBus } from './unhandled-exception-bus';
import { AggregateRootStorage } from './storages/aggregate-root.storage';

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

  static async forRootAsync(
    options: CqrsModuleAsyncOptions,
  ): Promise<DynamicModule> {
    const asyncOptions = await this.createAsyncOptions(options);

    return {
      module: CqrsModule,
      providers: [
        {
          provide: CQRS_MODULE_OPTIONS,
          useValue: asyncOptions,
        },
        ...(options.extraProviders || []),
      ],
      exports: [CQRS_MODULE_OPTIONS],
      global: true,
    };
  }

  private static async createAsyncOptions(
    options: CqrsModuleAsyncOptions,
  ): Promise<CqrsModuleOptions> {
    if (options.useFactory) {
      return options.useFactory(...(options.inject || []));
    }

    throw new Error(
      'Invalid CqrsModuleAsyncOptions configuration. Provide useFactory.',
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
