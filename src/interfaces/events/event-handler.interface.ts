import { IEvent } from './event.interface.js';

/**
 * Represents an event handler.
 */
export interface IEventHandler<T extends IEvent = any> {
  /**
   * Handles an event.
   * @param event The event to handle.
   */
  handle(event: T): any;
}
