import { ICommandPublisher } from './commands/command-publisher.interface';
import { EventIdProvider } from './events/event-id-provider.interface';
import { IEventPublisher } from './events/event-publisher.interface';
import { IUnhandledExceptionPublisher } from './exceptions/unhandled-exception-publisher.interface';
import { IQueryPublisher } from './queries/query-publisher.interface';

/**
 * Options for the CqrsModule.
 *
 * @publicApi
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
   * Event ID provider to use for retrieving event IDs by event instances.
   * @default DefaultEventIdProvider
   */
  eventIdProvider?: EventIdProvider;
  /**
   * Whether to rethrow unhandled exceptions.
   * @default false
   */
  rethrowUnhandled?: boolean;
}

import { Provider, Type } from '@nestjs/common';

/**
 * Options for the CqrsModuleOptionsFactory.
 *
 * @publicApi
 */
export interface CqrsModuleOptionsFactory {
  createCqrsOptions(): Promise<CqrsModuleOptions> | CqrsModuleOptions;
}

/**
 * Options for the CqrsModuleAsyncOptions.
 *
 * @publicApi
 */
export interface CqrsModuleAsyncOptions {
  imports?: any[];
  useExisting?: Type<CqrsModuleOptionsFactory>;
  useClass?: Type<CqrsModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<CqrsModuleOptions> | CqrsModuleOptions;
  useValue?: CqrsModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}
