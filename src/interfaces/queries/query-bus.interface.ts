import { IQuery } from './query.interface';

/**
 * Represents a query bus.
 */
export interface IQueryBus<QueryBase extends IQuery<TResponse> = IQuery, TResponse= any> {
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  execute<T extends QueryBase = QueryBase>(query: T): Promise<TResponse>;
}
