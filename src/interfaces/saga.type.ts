import { Observable } from 'rxjs';
import { ICommand } from './commands/command.interface';
import { IEvent } from './events/event.interface';

export type Saga = (events$: Observable<IEvent>) => Observable<ICommand>;
