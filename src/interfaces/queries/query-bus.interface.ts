import { Query } from '../../classes/query';
import { AsyncContext } from '../../scopes/async.context';
import { IQuery } from './query.interface';

/**
 * Represents a query bus.
 *
 * @publicApi
 */
export interface IQueryBus<QueryBase extends IQuery = IQuery> {
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  execute<TResult>(query: Query<TResult>): Promise<TResult>;
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  execute<T extends QueryBase, TResult = any>(query: T): Promise<TResult>;
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  execute<TResult>(
    query: Query<TResult>,
    asyncContext: AsyncContext,
  ): Promise<TResult>;
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  execute<T extends QueryBase, TResult = any>(
    query: T,
    asyncContext: AsyncContext,
  ): Promise<TResult>;
}
