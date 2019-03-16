import { IQuery } from './query.interface';

export interface IQueryBus {
  execute<T extends IQuery, TRes>(query: T): Promise<TRes>;
}
