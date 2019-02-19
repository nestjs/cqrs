import { IQuery } from './query.interface';

export interface IQueryHandler<T extends IQuery = any, TRes = any> {
  execute(query: T): Promise<TRes>;
}
