import { Observable } from 'rxjs';
import { ICommand } from './commands/command.interface';
import { IEvent } from './events/event.interface';

export type ISaga<EventBase extends IEvent = IEvent> = (
  events$: Observable<EventBase>,
) => Observable<ICommand>;
