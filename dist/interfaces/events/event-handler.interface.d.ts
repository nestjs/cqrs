import { IEvent } from './event.interface';
export interface IEventHandler<T extends IEvent> {
  handle(event: T): any;
}
