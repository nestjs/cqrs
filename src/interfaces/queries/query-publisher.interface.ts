import { IQuery } from './query.interface';

export interface IQueryPublisher<QueryBase extends IQuery<TResponse> = IQuery, TResponse = any> {
  publish<T extends QueryBase = QueryBase>(query: T): TResponse;
}
