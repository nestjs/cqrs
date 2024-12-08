import 'reflect-metadata';
import { IQuery } from '../interfaces';
import { QUERY_HANDLER_METADATA, QUERY_METADATA } from './constants';

/**
 * Decorator that marks a class as a Nest query handler. A query handler
 * handles queries executed by your application code.
 *
 * The decorated class must implement the `IQueryHandler` interface.
 *
 * @param query query *type* to be handled by this handler.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#queries
 */
export const QueryHandler = (query: IQuery): ClassDecorator => {
  return (target: object) => {
    if (!Reflect.hasOwnMetadata(QUERY_METADATA, query)) {
      Reflect.defineMetadata(QUERY_METADATA, { id: crypto.randomUUID() }, query);
    }
    Reflect.defineMetadata(QUERY_HANDLER_METADATA, query, target);
  };
};
