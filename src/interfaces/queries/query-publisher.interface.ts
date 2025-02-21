import { IQuery } from './query.interface';

/**
 * Represents a query publisher.
 *
 * @publicApi
 */
export interface IQueryPublisher<QueryBase extends IQuery = IQuery> {
  publish<T extends QueryBase = QueryBase>(query: T): any;
}
