import { DynamicModule, Inject, Module, OnApplicationBootstrap, Provider } from '@nestjs/common';
import { CommandBus } from './command-bus';
import { EventBus } from './event-bus';
import { EventPublisher } from './event-publisher';
import {
  defaultCqrsModuleOptions,
  ICommand,
  ICommandPublisher,
  IEvent,
  IEventPublisher,
  IQuery,
  IQueryPublisher
} from './interfaces';
import { QueryBus } from './query-bus';
import { ExplorerService } from './services/explorer.service';
import {
  EVENTS_PUBLISHER_CLIENT,
  EVENTS_PUB_SUB,
  QUERIES_PUB_SUB,
  QUERIES_PUBLISHER_CLIENT,
  COMMANDS_PUB_SUB,
  COMMANDS_PUBLISHER_CLIENT,
} from "./constants";
import { CqrsModuleOptions } from "./interfaces/";
import { KafkaEventsPubSub } from "./pub-sub";
import { PropagationService } from "./services/propagation.service";

@Module({})
export class CqrsModule<
    EventBase extends IEvent = IEvent,
    QueryBase extends IQuery = IQuery,
    CommandBase extends ICommand = ICommand,
  >implements OnApplicationBootstrap {

  constructor(
    private readonly explorerService: ExplorerService<EventBase>,
    private readonly eventsBus: EventBus<EventBase>,
    private readonly queryBus: QueryBus<QueryBase>,
    private readonly commandsBus: CommandBus<CommandBase>,
  ) {}

  static forRoot<
    EventsPubSubBase extends IEventPublisher<EventBase> = IEventPublisher<IEvent>,
    QueriesPubSubBase extends IQueryPublisher<QueryBase> = IQueryPublisher<IQuery>,
    CommandsPubSubBase extends ICommandPublisher<CommandBase> = ICommandPublisher<ICommand>,
    EventBase extends IEvent = IEvent,
    QueryBase extends IQuery = IQuery,
    CommandBase extends ICommand = ICommand,
  >(
    options: CqrsModuleOptions<EventsPubSubBase, QueriesPubSubBase, CommandsPubSubBase> = {},
  ): DynamicModule {
    options = Object.assign(defaultCqrsModuleOptions, options);
    const pubSubProviders = [{
        provide: EVENTS_PUB_SUB,
        useClass: options.events.pubSub,
      }, {
        provide: QUERIES_PUB_SUB,
        useClass: options.queries.pubSub,
      }, {
        provide: COMMANDS_PUB_SUB,
        useClass: options.commands.pubSub,
      }
    ];

    const clientsProviders = [{
        provide: EVENTS_PUBLISHER_CLIENT,
        ...options.events.clientProvider
      },{
        provide: QUERIES_PUBLISHER_CLIENT,
        ...options.queries.clientProvider
      }, {
        provide: COMMANDS_PUBLISHER_CLIENT,
        ...options.commands.clientProvider
      }
    ];

    return {
      module: CqrsModule,
      providers: [
        CommandBus,
        QueryBus,
        EventBus,
        EventPublisher,
        ExplorerService,
        PropagationService,
        ...pubSubProviders as Provider[],
        ...clientsProviders as Provider[],
      ],
      exports: [
        CommandBus,
        QueryBus,
        EventBus,
        EventPublisher,
        PropagationService,
        ...[
          ...pubSubProviders, ...clientsProviders
        ].map(c => c.provide)
      ],
    };
  }

  onApplicationBootstrap() {
    const { events, commands, queries, sagas } = this.explorerService.explore();

    this.eventsBus.register(events);
    this.commandsBus.register(commands);
    this.queryBus.register(queries);
    this.eventsBus.registerSagas(sagas);
  }
}
