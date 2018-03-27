import { EventObservable } from './event-observable.interface';
import { IEvent } from './events/event.interface';
export declare type Saga = (events$: EventObservable<IEvent>) => any;
