import { IEvent } from './event.interface';

export interface IEventHandler<T extends IEvent = any> {
  handle(event: T): any;
}
