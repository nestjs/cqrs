import { IQuery, ReturningQuery } from './query.interface';

export interface IQueryBus<QueryBase extends IQuery = IQuery> {
  execute<T extends QueryBase = QueryBase, K = T extends ReturningQuery<infer U> ? U : unknown>(query: T): Promise<K>;
}
