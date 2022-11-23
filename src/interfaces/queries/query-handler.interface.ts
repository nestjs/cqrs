import { IQueryResult } from './query-result.interface';
import { IQuery } from './query.interface';

export interface IQueryHandler<T extends IQuery = any, TRes = IQueryResult<T>> {
  execute(query: T): Promise<TRes>;
}
