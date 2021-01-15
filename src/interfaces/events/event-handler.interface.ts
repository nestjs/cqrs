import { Scope } from '@nestjs/common';
import { IEvent } from './event.interface';

export interface EventHandlerOptions {
  /**
   * Specifies one or more event *types* to be handled by this handler.
   */
  events: IEvent[];

  /**
   * Specifies the lifetime of a handler.
   */
  scope?: Scope;
}

export interface IEventHandler<T extends IEvent = any> {
  handle(event: T): any;
}
