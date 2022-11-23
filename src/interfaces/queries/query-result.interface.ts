import { IQuery } from './query.interface';

export type IQueryResult<
  T extends IQuery = any,
  TDefault = any,
> = T extends IQuery<infer R> ? R : TDefault;
