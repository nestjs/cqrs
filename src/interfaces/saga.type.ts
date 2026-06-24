import { Observable } from 'rxjs';
import { ICommand } from './commands/command.interface.js';
import { IEvent } from './events/event.interface.js';

export type ISaga<
  EventBase extends IEvent = IEvent,
  CommandBase extends ICommand = ICommand,
> = (events$: Observable<EventBase>) => Observable<CommandBase>;
