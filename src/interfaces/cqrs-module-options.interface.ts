import { ICommandPublisher } from './commands/command-publisher.interface.js';
import { EventIdProvider } from './events/event-id-provider.interface.js';
import { IEventPublisher } from './events/event-publisher.interface.js';
import { IUnhandledExceptionPublisher } from './exceptions/unhandled-exception-publisher.interface.js';
import { IQueryPublisher } from './queries/query-publisher.interface.js';

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
  /**
   * What a saga does after its stream throws, when `rethrowUnhandled` is not set (the error is then published and logged).
   * `'complete'` stops the saga. `'resubscribe'` subscribes to the stream again after 100 ms,
   * doubling with each error up to 30 s; the delay starts again from 100 ms after a minute without
   * errors, not after a successful event. Events published while it waits are missed,
   * and operators such as `startWith` run again. Events in flight inside the saga (in `delay` or an
   * async `mergeMap`) are dropped either way; catch errors per event in the inner `mergeMap` instead.
   * @default 'complete'
   */
  sagaErrorStrategy?: 'complete' | 'resubscribe';
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
