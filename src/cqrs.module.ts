import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnModuleInit,
  Optional,
  Provider,
} from '@nestjs/common';
import { CommandBus } from './command-bus';
import { CQRS_MODULE_OPTIONS } from './constants';
import { EventBus } from './event-bus';
import { EventPublisher } from './event-publisher';
import { CqrsModuleOptions } from './interfaces';
import { QueryBus } from './query-bus';

@Global()
@Module({})
export class CqrsModule implements OnModuleInit {
  constructor(
    @Optional()
    @Inject(CQRS_MODULE_OPTIONS)
    private readonly cqrsOptions: CqrsModuleOptions = {},
    private readonly eventsBus: EventBus,
    private readonly commandsBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  static forRoot(): DynamicModule {
    return {
      module: CqrsModule,
      providers: [CommandBus, QueryBus, EventBus, EventPublisher],
      exports: [CommandBus, QueryBus, EventBus, EventPublisher],
    };
  }

  static forFeature(options: CqrsModuleOptions = {}): DynamicModule {
    return {
      module: CqrsModule,
      providers: [CqrsModule.getOptionsProvider(options)],
    };
  }

  onModuleInit() {
    const { events, queries, sagas, commands } = this.cqrsOptions;

    this.eventsBus.register(events);
    this.commandsBus.register(commands);
    this.queryBus.register(queries);
    this.eventsBus.registerSagas(sagas);
  }

  private static getOptionsProvider(options: CqrsModuleOptions = {}): Provider {
    const { sagas = [], queries = [], events = [], commands = [] } = options;
    return {
      provide: CQRS_MODULE_OPTIONS,
      useValue: {
        sagas,
        queries,
        events,
        commands,
      } as CqrsModuleOptions,
    };
  }
}
