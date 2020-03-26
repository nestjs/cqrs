import { IQuery } from './query.interface';
import { IQueryResult } from './query-result.interface';

export interface IQueryHandler<TResult extends IQueryResult = any, T extends IQuery<TResult> = any> {
  execute(query: T): Promise<TResult>;
}
