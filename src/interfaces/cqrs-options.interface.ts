import { Type } from '@nestjs/common';
import { ICommandHandler } from './commands/command-handler.interface';
import { IEventHandler } from './events/event-handler.interface';
import { IQueryHandler } from './queries/query-handler.interface';
import { ICommandInterceptor } from './commands/command-interceptor.interface';

export interface CqrsOptions {
  events?: Type<IEventHandler>[];
  queries?: Type<IQueryHandler>[];
  commands?: Type<ICommandHandler>[];
  sagas?: Type<any>[];
  interceptors?: Type<ICommandInterceptor>[];
}
