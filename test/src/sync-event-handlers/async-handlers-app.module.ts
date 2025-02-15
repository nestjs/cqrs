import { Module } from '@nestjs/common';
import { CqrsModule } from '../../../src';
import { EventHandlers } from './events/handlers';

@Module({
  imports: [CqrsModule.forRoot()],
  providers: [...EventHandlers],
})
export class AsyncHandlersAppModule {}
