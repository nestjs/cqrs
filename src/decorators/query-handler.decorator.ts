import 'reflect-metadata';
import { IQuery, QueryHandlerOptions } from '../interfaces';
import { QUERY_HANDLER_METADATA, SCOPE_OPTIONS_METADATA } from './constants';

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
export function QueryHandler(query: IQuery): ClassDecorator;

/**
 * Decorator that marks a class as a Nest query handler. A query handler
 * handles queries executed by your application code.
 *
 * The decorated class must implement the `IQueryHandler` interface.
 *
 * @param options options specifying query *type* to be handled by this handler and scope of handler.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#queries
 */
export function QueryHandler(options: QueryHandlerOptions): ClassDecorator;

/**
 * Decorator that marks a class as a Nest query handler. A query handler
 * handles queries executed by your application code.
 *
 * The decorated class must implement the `IQueryHandler` interface.
 *
 * @param queryOrOptions query *type* to be handled by this handler or a `QueryHandlerOptions` object.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#queries
 */
export function QueryHandler(
  queryOrOptions: IQuery | QueryHandlerOptions,
): ClassDecorator {
  return (target: object) => {
    if (
      !(queryOrOptions as any)?.prototype &&
      (queryOrOptions as QueryHandlerOptions)?.query
    ) {
      const options: QueryHandlerOptions = queryOrOptions as QueryHandlerOptions;
      Reflect.defineMetadata(QUERY_HANDLER_METADATA, options.query, target);
      Reflect.defineMetadata(
        SCOPE_OPTIONS_METADATA,
        { scope: options.scope },
        target,
      );
    } else {
      const query: IQuery = queryOrOptions as IQuery;
      Reflect.defineMetadata(QUERY_HANDLER_METADATA, query, target);
    }
  };
}
