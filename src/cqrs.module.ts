import { DynamicModule, Module, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus } from './command-bus';
import { CQRS_MODULE_OPTIONS } from './constants';
import { EventBus } from './event-bus';
import { EventPublisher } from './event-publisher';
import { CqrsModuleOptions, IEvent } from './interfaces';
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
  /**
   * Registers CQRS module globally.
   * @param options CQRS module options.
   * @returns A dynamic module.
   */
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
