import { Query } from './query';
import { IQuery } from './query.interface';

/**
 * Represents a query handler.
 */
export type IQueryHandler<
  QueryType extends IQuery = any,
  TRes = any,
> = QueryType extends Query<infer ResultType>
  ? BaseIQueryHandler<QueryType, ResultType>
  : BaseIQueryHandler<QueryType, TRes>;

/**
 * Basic interface for QueryHandlers
 * Can be used for both: inferred and declared return types
 */
interface BaseIQueryHandler<T extends IQuery = any, TRes = any> {
  /**
   * Executes a query.
   * @param query The query to execute.
   */
  execute(query: T): Promise<TRes>;
}
