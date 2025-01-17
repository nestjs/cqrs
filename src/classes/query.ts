import { IQuery } from '../interfaces';
import { RESULT_TYPE_SYMBOL } from './constants';

/**
 * Utility type to extract the result type of a query.
 */
export type QueryResult<C extends Query<unknown>> =
  C extends Query<infer R> ? R : never;

export class Query<T> implements IQuery {
  readonly [RESULT_TYPE_SYMBOL]: T;
}
