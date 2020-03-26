import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import 'reflect-metadata';
import { QUERY_HANDLER_METADATA } from './decorators/constants';
import { QueryHandlerNotFoundException } from './exceptions';
import { InvalidQueryHandlerException } from './exceptions/invalid-query-handler.exception';
import { IQuery, IQueryBus, IQueryHandler, IQueryResult } from './interfaces';
import { ObservableBus } from './utils/observable-bus';

export type QueryHandlerType = Type<IQueryHandler<IQuery<any>>>;

@Injectable()
export class QueryBus extends ObservableBus<IQuery<any>> implements IQueryBus {
  private handlers = new Map<string, IQueryHandler<IQuery<any>>>();

  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  async execute<TResult extends IQueryResult, T extends IQuery<TResult>>(
    query: T,
  ): Promise<TResult> {
    const handler = this.handlers.get(this.getQueryName(query));
    if (!handler) throw new QueryHandlerNotFoundException();

    this.subject$.next(query);
    const result = await handler.execute(query);
    return result as TResult;
  }

  bind<TResult extends IQueryResult, T extends IQuery<TResult>>(
    handler: IQueryHandler<T, TResult>,
    name: string,
  ) {
    this.handlers.set(name, handler);
  }

  register(handlers: QueryHandlerType[] = []) {
    handlers.forEach(handler => this.registerHandler(handler));
  }

  protected registerHandler(handler: QueryHandlerType) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const target = this.reflectQueryName(handler);
    if (!target) {
      throw new InvalidQueryHandlerException();
    }
    this.bind(instance as IQueryHandler<IQuery<any>>, target.name);
  }

  private getQueryName(query): string {
    const { constructor } = Object.getPrototypeOf(query);
    return constructor.name as string;
  }

  private reflectQueryName(handler: QueryHandlerType): FunctionConstructor {
    return Reflect.getMetadata(QUERY_HANDLER_METADATA, handler);
  }
}
