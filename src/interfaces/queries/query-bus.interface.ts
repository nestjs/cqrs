import { IQuery } from './query.interface';
import { IQueryResult } from './query-result.interface';

export interface IQueryBus {
  execute<TResult extends IQueryResult, T extends IQuery<TResult>>(query: T): Promise<TResult>;
}
