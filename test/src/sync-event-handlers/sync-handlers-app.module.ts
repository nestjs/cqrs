import { Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '../../../src';
import { EventHandlers } from './events/handlers';
import { SyncPublisher } from './sync-publisher';

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
