import { Type } from '@nestjs/common';
import { ICommandHandler } from './commands/command-handler.interface';
import { IEventHandler } from './events/event-handler.interface';
import { IQueryHandler } from './queries/query-handler.interface';
import { IEvent } from "./events/event.interface";
import { IQuery } from "./queries/query.interface";
import { ICommand } from "./commands/command.interface";
import { Constructor } from "../event-publisher";

export interface CqrsOptions<
  EventBase extends IEvent = IEvent,
  QueryBase extends IQuery = IQuery,
  CommandBase extends ICommand = ICommand,
> {
  events?: Type<IEventHandler>[];
  queries?: Type<IQueryHandler>[];
  commands?: Type<ICommandHandler>[];
  sagas?: Type<any>[],
  eventDtos: Constructor<EventBase>[],
  queryDtos: Constructor<QueryBase>[],
  commandDtos: Constructor<CommandBase>[],
}
