import { Query } from './query';

export type QueryResult<QueryT extends Query<unknown>> = QueryT extends Query<
  infer ResultT
>
  ? ResultT
  : never;
