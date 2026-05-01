import { Module } from '@nestjs/common';
import { CqrsModule } from '../../src/index.js';
import { UnhandledExceptionCommandHandler } from './errors/commands/unhandled-exception.handler.js';
import { UnhandledExceptionEventHandler } from './errors/events/unhandled-exception.handler.js';
import { ErrorsSagas } from './errors/sagas/errors.saga.js';
import { HeroesGameModule } from './heroes/heroes.module.js';
import { NoopModule } from './noop/noop.module.js';
import { ScopedModule } from './scoped/scoped.module.js';

@Module({
  imports: [HeroesGameModule, CqrsModule.forRoot(), ScopedModule, NoopModule],
  providers: [
    UnhandledExceptionCommandHandler,
    UnhandledExceptionEventHandler,
    ErrorsSagas,
  ],
})
export class AppModule {}
