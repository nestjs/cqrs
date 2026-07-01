import { Inject, Injectable, Logger, Optional, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper.js';
import 'reflect-metadata';
import { Query } from './classes/query.js';
import { CQRS_MODULE_OPTIONS } from './constants.js';
import {
  QUERY_HANDLER_METADATA,
  QUERY_METADATA,
} from './decorators/constants.js';
import { QueryHandlerNotFoundException } from './exceptions/index.js';
import { InvalidQueryHandlerException } from './exceptions/invalid-query-handler.exception.js';
import { DefaultQueryPubSub } from './helpers/default-query-pubsub.js';
import {
  CqrsModuleOptions,
  IQuery,
  IQueryBus,
  IQueryHandler,
  IQueryPublisher,
  IQueryResult,
} from './interfaces/index.js';
import { QueryMetadata } from './interfaces/queries/query-metadata.interface.js';
import { AsyncContext } from './scopes/index.js';
import { ObservableBus } from './utils/observable-bus.js';

export type QueryHandlerType<
  QueryBase extends IQuery = IQuery,
  QueryResultBase extends IQueryResult = IQueryResult,
> = Type<IQueryHandler<QueryBase, QueryResultBase>>;

/**
 * @publicApi
 */
@Injectable()
export class QueryBus<QueryBase extends IQuery = IQuery>
  extends ObservableBus<QueryBase>
  implements IQueryBus<QueryBase>
{
  private readonly logger = new Logger(QueryBus.name);
  private handlers = new Map<
    string,
    (query: QueryBase, asyncContext?: AsyncContext) => any
  >();
  private _publisher: IQueryPublisher<QueryBase>;

  constructor(
    private readonly moduleRef: ModuleRef,
    @Optional()
    @Inject(CQRS_MODULE_OPTIONS)
    private readonly options?: CqrsModuleOptions,
  ) {
    super();

    if (this.options?.queryPublisher) {
      this._publisher = this.options.queryPublisher;
    } else {
      this.useDefaultPublisher();
    }
  }

  /**
   * Returns the publisher.
   */
  get publisher(): IQueryPublisher<QueryBase> {
    return this._publisher;
  }

  /**
   * Sets the publisher.
   * Default publisher is `DefaultQueryPubSub` (in memory).
   * @param _publisher The publisher to set.
   */
  set publisher(_publisher: IQueryPublisher<QueryBase>) {
    this._publisher = _publisher;
  }

  /**
   * Executes a query.
   * @param query The query to execute.
   */
  execute<TResult>(query: Query<TResult>): Promise<TResult>;
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  async execute<T extends QueryBase, TResult = any>(query: T): Promise<TResult>;
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  async execute<TResult>(
    query: Query<TResult>,
    asyncContext: AsyncContext,
  ): Promise<TResult>;
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  async execute<T extends QueryBase, TResult = any>(
    query: T,
    asyncContext: AsyncContext,
  ): Promise<TResult>;
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  async execute<T extends QueryBase, TResult = any>(
    query: T,
    asyncContext?: AsyncContext,
  ): Promise<TResult> {
    const queryId = this.getQueryId(query);
    const handler = this.handlers.get(queryId);
    if (!handler) {
      const queryName = this.getQueryName(query);
      throw new QueryHandlerNotFoundException(queryName);
    }

    this._publisher.publish(query);
    return (await handler(query, asyncContext)) as TResult;
  }

  bind<T extends QueryBase, TResult extends IQueryResult = any>(
    handler: InstanceWrapper<IQueryHandler<T, TResult>>,
    queryId: string,
  ) {
    if (handler.isDependencyTreeStatic()) {
      const instance = handler.instance;
      if (!instance.execute) {
        throw new InvalidQueryHandlerException();
      }
      this.handlers.set(queryId, (query) =>
        instance.execute(query as T & Query<unknown>),
      );
      return;
    }

    this.handlers.set(queryId, async (query: T, context?: AsyncContext) => {
      context ??= AsyncContext.of(query) ?? new AsyncContext();

      this.moduleRef.registerRequestByContextId(context, context.id);
      const instance = await this.moduleRef.resolve(
        handler.metatype!,
        context.id,
        {
          strict: false,
        },
      );
      return instance.execute(query as T & Query<unknown>);
    });
  }

  register(handlers: InstanceWrapper<IQueryHandler<QueryBase>>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(
    handler: InstanceWrapper<IQueryHandler<QueryBase>>,
  ) {
    const typeRef = (
      handler.inject ? handler.instance?.constructor : handler.metatype
    ) as Type<IQueryHandler<QueryBase>>;
    const target = this.reflectQueryId(typeRef);
    if (!target) {
      throw new InvalidQueryHandlerException();
    }
    if (this.handlers.has(target)) {
      this.logger.warn(
        `Query handler [${typeRef.name}] is already registered. Overriding previously registered handler.`,
      );
    }
    this.bind(handler, target);
  }

  private getQueryId(query: QueryBase): string {
    const { constructor: queryType } = Object.getPrototypeOf(query);
    const queryMetadata: QueryMetadata = Reflect.getMetadata(
      QUERY_METADATA,
      queryType,
    );
    if (!queryMetadata) {
      throw new QueryHandlerNotFoundException(queryType.name);
    }

    return queryMetadata.id;
  }

  private reflectQueryId(
    handler: QueryHandlerType<QueryBase>,
  ): string | undefined {
    const query: Type<QueryBase> = Reflect.getMetadata(
      QUERY_HANDLER_METADATA,
      handler,
    );
    const queryMetadata: QueryMetadata = Reflect.getMetadata(
      QUERY_METADATA,
      query,
    );
    return queryMetadata.id;
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultQueryPubSub<QueryBase>(this.subject$);
  }

  private getQueryName(query: QueryBase): string {
    const { constructor } = Object.getPrototypeOf(query);
    return constructor.name as string;
  }
}
