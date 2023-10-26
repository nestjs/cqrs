import { IQuery } from './query.interface';

/**
 * Represents a query handler.
 */
export interface IQueryHandler<T extends IQuery<TResponse> = IQuery, TResponse = any> {
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  execute(query: T): Promise<TResponse>;
}
