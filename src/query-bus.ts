import { Inject, Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import 'reflect-metadata';
import { QUERY_HANDLER_METADATA } from './decorators/constants';
import { QueryHandlerNotFoundException } from './exceptions';
import { InvalidQueryHandlerException } from './exceptions/invalid-query-handler.exception';
import {
  IQuery,
  IQueryBus,
  IQueryHandler,
  IQueryPublisher,
  IQueryResult,
} from './interfaces';
import { ObservableBus } from './utils/observable-bus';
import { QUERIES_PUB_SUB, QUERIES_PUBLISHER_CLIENT } from "./constants";
import { IPubSubClient } from "./interfaces/pub-sub-client.interface";

export type QueryHandlerType<
  QueryBase extends IQuery = IQuery,
  QueryResultBase extends IQueryResult = IQueryResult
> = Type<IQueryHandler<QueryBase, QueryResultBase>>;

@Injectable()
export class QueryBus<QueryBase extends IQuery = IQuery>
  extends ObservableBus<QueryBase>
  implements IQueryBus<QueryBase> {
  private handlers = new Map<string, IQueryHandler<QueryBase, IQueryResult>>();

  constructor(
      @Inject(QUERIES_PUB_SUB) private readonly _publisher: IQueryPublisher<QueryBase>,
      @Inject(QUERIES_PUBLISHER_CLIENT) private readonly _client: IPubSubClient,
      private readonly moduleRef: ModuleRef
  ) {
    super();
    this._publisher.bridgeQueriesTo(this.subject$);
  }

  get publisher(): IQueryPublisher<QueryBase> {
    return this._publisher;
  }

  async execute<T extends QueryBase, TResult = any>(
    pattern: string,
    query: T,
  ): Promise<TResult> {
    if (this.isDefaultPubSub()) {
      return this.executeLocally(query);
    }

    return this._publisher.publish(pattern, query) as TResult;
  }

  async executeLocally<T extends QueryBase, TResult = any>(
      query: T,
  ): Promise<TResult> {
    const queryName = this.getQueryName((query as any) as Function);
    const handler = this.handlers.get(queryName);
    if (!handler) {
      throw new QueryHandlerNotFoundException(queryName);
    }

    this.subject$.next(query);
    const result = await handler.execute(query);
    return result as TResult;
  }

  bind<T extends QueryBase, TResult = any>(
    handler: IQueryHandler<T, TResult>,
    name: string,
  ) {
    this.handlers.set(name, handler);
  }

  register(handlers: QueryHandlerType<QueryBase>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: QueryHandlerType<QueryBase>) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const target = this.reflectQueryName(handler);
    if (!target) {
      throw new InvalidQueryHandlerException();
    }
    this.bind(instance as IQueryHandler<QueryBase, IQueryResult>, target.name);
  }

  private getQueryName(query: Function): string {
    const { constructor } = Object.getPrototypeOf(query);
    return constructor.name as string;
  }

  private reflectQueryName(
    handler: QueryHandlerType<QueryBase>,
  ): FunctionConstructor {
    return Reflect.getMetadata(QUERY_HANDLER_METADATA, handler);
  }

  private isDefaultPubSub(): boolean {
    return !this._client;
  }
}
