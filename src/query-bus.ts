import { Injectable, Type } from '@nestjs/common';
import 'reflect-metadata';
import { InvalidModuleRefException, InvalidQueryHandlerException } from '.';
import { QueryHandlerNotFoundException } from './exceptions';
import { IQuery, IQueryBus, IQueryHandler, IQueryResult } from './interfaces';
import { QUERY_HANDLER_METADATA } from './utils/constants';
import { ObservableBus } from './utils/observable-bus';

export type QueryHandlerType = Type<
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

  register(handlers: QueryHandlerType[]) {
    handlers.forEach(handler => this.registerHandler(handler));
  }

  protected registerHandler(handler: QueryHandlerType) {
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

  private reflectQueryName(handler: QueryHandlerType): FunctionConstructor {
    return Reflect.getMetadata(QUERY_HANDLER_METADATA, handler);
  }
}
