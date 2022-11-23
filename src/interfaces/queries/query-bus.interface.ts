import { IQueryResult } from './query-result.interface';
import { IQuery } from './query.interface';

export interface IQueryBus<QueryBase extends IQuery = IQuery> {
  execute<T extends QueryBase = QueryBase, TRes = IQueryResult<QueryBase>>(
    query: T,
  ): Promise<TRes>;
}
