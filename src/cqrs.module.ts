import { Module, OnModuleInit } from '@nestjs/common';
import { CommandBus } from './command-bus';
import { EventBus } from './event-bus';
import { EventPublisher } from './event-publisher';
import { IEvent } from './interfaces';
import { QueryBus } from './query-bus';
import { ExplorerService } from './services/explorer.service';

@Module({
  providers: [CommandBus, QueryBus, EventBus, EventPublisher, ExplorerService],
  exports: [CommandBus, QueryBus, EventBus, EventPublisher],
})
export class CqrsModule<EventBase extends IEvent = IEvent>
  implements OnModuleInit {
  constructor(
    private readonly explorerService: ExplorerService<EventBase>,
    private readonly eventsBus: EventBus<EventBase>,
    private readonly commandsBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async onModuleInit(): Promise<void> {
    const { events, queries, sagas, commands } = this.explorerService.explore();

    await this.eventsBus.register(events);
    this.commandsBus.register(commands);
    this.queryBus.register(queries);
    await this.eventsBus.registerSagas(sagas);
  }
}
