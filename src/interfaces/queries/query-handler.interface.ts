import { Scope } from '@nestjs/common';
import { IQuery } from './query.interface';

export interface QueryHandlerOptions {
  /**
   * query *type* to be handled by this handler.
   */
  query: IQuery;

  /**
   * Specifies the lifetime of a handler.
   */
  scope?: Scope;
}

export interface IQueryHandler<T extends IQuery = any, TRes = any> {
  execute(query: T): Promise<TRes>;
}
