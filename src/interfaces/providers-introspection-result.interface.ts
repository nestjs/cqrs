import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper.js';
import { ICommandHandler } from './commands/command-handler.interface.js';
import { IEventHandler } from './events/event-handler.interface.js';
import { IQueryHandler } from './queries/query-handler.interface.js';

export interface ProvidersIntrospectionResult {
  events?: InstanceWrapper<IEventHandler>[];
  queries?: InstanceWrapper<IQueryHandler>[];
  commands?: InstanceWrapper<ICommandHandler>[];
  sagas?: InstanceWrapper<object>[];
}
