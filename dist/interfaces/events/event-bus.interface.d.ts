import { IEvent } from './event.interface';
export interface IEventBus {
  publish<T extends IEvent>(event: T): any;
}
