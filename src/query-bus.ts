import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import 'reflect-metadata';
import { QUERY_HANDLER_METADATA } from './decorators/constants';
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
import { getClassName } from './utils';
import { HandlerRegister } from './utils/handler-register';
import { ObservableBus } from './utils/observable-bus';

export type QueryHandlerType<
  QueryBase extends IQuery = IQuery,
  QueryResultBase extends IQueryResult = IQueryResult
> = Type<IQueryHandler<QueryBase, QueryResultBase>>;

@Injectable()
export class QueryBus<QueryBase extends IQuery = IQuery>
  extends ObservableBus<QueryBase>
  implements IQueryBus<QueryBase> {
  private handlers = new HandlerRegister<IQueryHandler<QueryBase, any>>(
    this.moduleRef,
    QUERY_HANDLER_METADATA,
  );
  private _publisher: IQueryPublisher<QueryBase>;

  constructor(private readonly moduleRef: ModuleRef) {
    super();
    this.useDefaultPublisher();
  }

  get publisher(): IQueryPublisher<QueryBase> {
    return this._publisher;
  }

  set publisher(_publisher: IQueryPublisher<QueryBase>) {
    this._publisher = _publisher;
  }

  async execute<T extends QueryBase, TResult = any>(
    query: T,
  ): Promise<TResult> {
    const handler = await this.handlers.get(query);
    if (!handler) {
      throw new QueryHandlerNotFoundException(getClassName(query));
    }
    this.subject$.next(query);
    return handler.execute(query);
  }

  register(handlers: QueryHandlerType<QueryBase>[] = []): void {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: QueryHandlerType<QueryBase>): void {
    if (!this.handlers.registerHandler(handler)) {
      throw new InvalidQueryHandlerException();
    }
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultQueryPubSub<QueryBase>(this.subject$);
  }
}
