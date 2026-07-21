import { Module } from '@nestjs/common';
import { NoopHandler } from './events/handlers/noop.handler.js';

@Module({
  providers: [NoopHandler],
})
export class NoopModule {}
