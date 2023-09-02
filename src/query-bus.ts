import { Injectable, Logger, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import 'reflect-metadata';
import { QUERY_HANDLER_METADATA, QUERY_METADATA } from './decorators/constants';
import { QueryHandlerNotFoundException } from './exceptions';
import { InvalidQueryHandlerException } from './exceptions/invalid-query-handler.exception';
import { DefaultQueryPubSub } from './helpers/default-query-pubsub';
import {
  IQuery,
  IQueryBus,
  IQueryHandler,
  IQueryPublisher,
  IQueryResult,
} from './interfaces';
import { QueryMetadata } from './interfaces/queries/query-metadata.interface';
import { ObservableBus } from './utils/observable-bus';

export type QueryHandlerType<
  QueryBase extends IQuery = IQuery,
  QueryResultBase extends IQueryResult = IQueryResult,
> = Type<IQueryHandler<QueryBase, QueryResultBase>>;

@Injectable()
export class QueryBus<QueryBase extends IQuery = IQuery>
  extends ObservableBus<QueryBase>
  implements IQueryBus<QueryBase>
{
  private handlers = new Map<string, IQueryHandler<QueryBase, IQueryResult>>();
  private _publisher: IQueryPublisher<QueryBase>;
  private readonly _logger = new Logger(QueryBus.name);

  constructor(private readonly moduleRef: ModuleRef) {
    super();
    this.useDefaultPublisher();
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
  async execute<T extends QueryBase, TResult = any>(
    query: T,
  ): Promise<TResult> {
    const queryId = this.getQueryId(query);
    const handler = this.handlers.get(queryId);
    if (!handler) {
      throw new QueryHandlerNotFoundException(queryId);
    }

    this._publisher.publish(query);
    const result = await handler.execute(query);
    return result as TResult;
  }

  bind<T extends QueryBase, TResult = any>(
    handler: IQueryHandler<T, TResult>,
    { id, name }: QueryMetadata,
  ) {
    if (this.handlers.has(id)) {
      const previousHandlerName = this.handlers.get(id).constructor.name;
      const handlerName = handler.constructor.name;
      this._logger.warn(
        `Multiple handlers for query ${name}. Repleacing ${previousHandlerName} with ${handlerName}.`,
      );
    }
    this.handlers.set(id, handler);
  }

  register(handlers: QueryHandlerType<QueryBase>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: QueryHandlerType<QueryBase>) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const queryMetadata = this.reflectQueryMetadata(handler);
    if (!queryMetadata) {
      throw new InvalidQueryHandlerException();
    }
    this.bind(
      instance as IQueryHandler<QueryBase, IQueryResult>,
      queryMetadata,
    );
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

  private reflectQueryMetadata(
    handler: QueryHandlerType<QueryBase>,
  ): QueryMetadata {
    const query: Type<QueryBase> = Reflect.getMetadata(
      QUERY_HANDLER_METADATA,
      handler,
    );
    return Reflect.getMetadata(QUERY_METADATA, query);
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultQueryPubSub<QueryBase>(this.subject$);
  }
}
