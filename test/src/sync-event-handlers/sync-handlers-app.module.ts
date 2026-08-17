import { Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '../../../src/index.js';
import { EventHandlers } from './events/handlers/index.js';
import { SyncPublisher } from './sync-publisher.js';

@Module({
  imports: [
    CqrsModule.forRoot({
      eventPublisher: new SyncPublisher(),
    }),
  ],
  providers: [...EventHandlers],
})
export class SyncHandlersAppModule implements OnModuleInit {
  constructor(private readonly eventBus: EventBus) {}

  onModuleInit() {
    (this.eventBus.publisher as SyncPublisher<IEvent>).setEventOperators(
      this.eventBus.eventOperators,
    );
  }
}
