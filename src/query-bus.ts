import 'reflect-metadata';
import { Injectable, Type } from '@nestjs/common';
import { IQueryBus, IQuery, IQueryHandler, IQueryResult } from './interfaces';
import { QueryHandlerNotFoundException } from './exceptions';
import { ObservableBus } from './utils/observable-bus';
import { QUERY_HANDLER_METADATA } from './utils/constants';
import { InvalidQueryHandlerException, InvalidModuleRefException } from '.';

export type QueryHandlerMetatype = Type<
  IQueryHandler<IQuery<IQueryResult>, IQueryResult>
>;

@Injectable()
export class QueryBus extends ObservableBus<IQuery<IQueryResult>>
  implements IQueryBus {
  private handlers = new Map<
    string,
    IQueryHandler<IQuery<IQueryResult>, IQueryResult>
  >();
  private moduleRef = null;

  setModuleRef(moduleRef) {
    this.moduleRef = moduleRef;
  }

  async execute<T extends IQuery<TResult>, TResult extends IQueryResult>(
    query: T,
  ): Promise<TResult> {
    const handler = this.handlers.get(this.getQueryName(query));
    if (!handler) throw new QueryHandlerNotFoundException();

    this.subject$.next(query);
    const result = await handler.execute(query);
    return result as TResult;
  }

  bind<T extends IQuery<TResult>, TResult>(
    handler: IQueryHandler<T, TResult>,
    name: string,
  ) {
    this.handlers.set(name, handler);
  }

  register(handlers: QueryHandlerMetatype[]) {
    handlers.forEach(handler => this.registerHandler(handler));
  }

  protected registerHandler(handler: QueryHandlerMetatype) {
    if (!this.moduleRef) {
      throw new InvalidModuleRefException();
    }
    const instance = this.moduleRef.get(handler);
    if (!instance) return;

    const target = this.reflectQueryName(handler);
    if (!target) {
      throw new InvalidQueryHandlerException();
    }
    this.bind(
      instance as IQueryHandler<IQuery<IQueryResult>, IQueryResult>,
      target.name,
    );
  }

  private getQueryName(query): string {
    const { constructor } = Object.getPrototypeOf(query);
    return constructor.name as string;
  }

  private reflectQueryName(handler: QueryHandlerMetatype): FunctionConstructor {
    return Reflect.getMetadata(QUERY_HANDLER_METADATA, handler);
  }
}
