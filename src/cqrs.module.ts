import { Module } from "@nestjs/common";
import { CommandBus } from "./command-bus";
import { EventPublisher } from "./event-publisher";
import { EventBus } from "./event-bus";

@Module({
  providers: [CommandBus, EventBus, EventPublisher],
  exports: [CommandBus, EventBus, EventPublisher]
})
export class CQRSModule {}
