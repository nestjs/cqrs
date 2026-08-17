import { Module } from '@nestjs/common';
import { CqrsModule } from '../../../src/index.js';
import { EventHandlers } from './events/handlers/index.js';

@Module({
  imports: [CqrsModule.forRoot()],
  providers: [...EventHandlers],
})
export class AsyncHandlersAppModule {}
