import { IQuery, ReturningQuery } from './query.interface';

export interface IQueryHandler<T extends IQuery = any, K = T extends ReturningQuery<infer U> ? U : unknown> {
  execute(query: T): Promise<K>;
}
