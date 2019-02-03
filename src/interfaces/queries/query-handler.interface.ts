import { IQuery } from './query.interface';

export interface IQueryHandler<T extends IQuery<TRes>, TRes> {
  execute(query: T): Promise<TRes>;
}
