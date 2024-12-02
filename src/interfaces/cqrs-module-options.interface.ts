import { ICommandPublisher } from './commands/command-publisher.interface';
import { IEventPublisher } from './events/event-publisher.interface';
import { IUnhandledExceptionPublisher } from './exceptions/unhandled-exception-publisher.interface';
import { IQueryPublisher } from './queries/query-publisher.interface';

/**
 * Options for the CqrsModule.
 */
export interface CqrsModuleOptions {
  /**
   * Command publisher to use for publishing commands.
   * @default DefaultCommandPubSub
   */
  commandPublisher?: ICommandPublisher;
  /**
   * Event publisher to use for publishing events.
   * @default DefaultPubSub
   */
  eventPublisher?: IEventPublisher;
  /**
   * Query publisher to use for publishing queries.
   * @default DefaultQueryPubSub
   */
  queryPublisher?: IQueryPublisher;
  /**
   * Unhandled exception publisher to use for publishing unhandled exceptions.
   * @default DefaultUnhandledExceptionPubSub
   */
  unhandledExceptionPublisher?: IUnhandledExceptionPublisher;
  /**
   * Whether to rethrow unhandled exceptions.
   * @default false
   */
  rethrowUnhandled?: boolean;
}
