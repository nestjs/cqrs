import { Query } from '../../classes/index.js';
import { IQuery } from './query.interface.js';

/**
 * Represents a query handler.
 *
 * @publicApi
 */
export type IQueryHandler<T extends IQuery = any, TRes = any> =
  T extends Query<infer InferredQueryResult>
    ? {
        /**
         * Executes a query.
         * @param query The query to execute.
         */
        execute(query: T): Promise<InferredQueryResult>;
      }
    : {
        /**
         * Executes a query.
         * @param query The query to execute.
         */
        execute(query: T): Promise<TRes>;
      };
