import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ICommandHandler } from './commands/command-handler.interface';
import { IEventHandler } from './events/event-handler.interface';
import { IQueryHandler } from './queries/query-handler.interface';

export interface ProvidersIntrospectionResult {
  events?: InstanceWrapper<IEventHandler>[];
  queries?: InstanceWrapper<IQueryHandler>[];
  commands?: InstanceWrapper<ICommandHandler>[];
  sagas?: InstanceWrapper<object>[];
}
