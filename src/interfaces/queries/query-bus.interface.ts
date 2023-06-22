import { IQuery } from './query.interface';

/**
 * Represents a query bus.
 */
export interface IQueryBus<QueryBase extends IQuery = IQuery> {
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  execute<T extends QueryBase = QueryBase, TRes = any>(query: T): Promise<TRes>;
}
