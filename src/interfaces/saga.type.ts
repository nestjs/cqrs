import { Observable } from 'rxjs';
import { ICommand } from './commands/command.interface';
import { IEvent } from './events/event.interface';

export type ISaga<
  EventBase extends IEvent = IEvent,
  CommandBase extends ICommand = ICommand,
> = (events$: Observable<EventBase>) => Observable<CommandBase>;
