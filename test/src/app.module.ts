import { Module } from '@nestjs/common';
import { CqrsModule } from '../../src';
import { UnhandledExceptionCommandHandler } from './errors/commands/unhandled-exception.handler';
import { UnhandledExceptionEventHandler } from './errors/events/unhandled-exception.handler';
import { ErrorsSagas } from './errors/sagas/errors.saga';
import { HeroesGameModule } from './heroes/heroes.module';

@Module({
  imports: [HeroesGameModule, CqrsModule.forRoot()],
  providers: [
    UnhandledExceptionCommandHandler,
    UnhandledExceptionEventHandler,
    ErrorsSagas,
  ],
})
export class AppModule {}
