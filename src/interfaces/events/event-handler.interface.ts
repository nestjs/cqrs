import { IEvent } from './event.interface';

/**
 * Represents an event handler.
 */
export interface IEventHandler<T extends IEvent<TResponse> = any, TResponse = any> {
  /**
   * Handles an event.
   * @param event The event to handle.
   */
  handle(event: T): any;
}
