import { Observable } from 'rxjs';
import { ICommand } from './commands/command.interface';
import { EventObservable } from './event-observable.interface';
import { IEvent } from './events/event.interface';

export type Saga = (events$: EventObservable<IEvent>) => Observable<ICommand>;
