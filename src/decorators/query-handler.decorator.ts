import 'reflect-metadata';
import { IQuery } from '../interfaces';
import { QUERY_HANDLER_METADATA } from './constants';

/**
 * QueryHandler's are responsive for the queries dispatch in `QueryBus` and usually used to `reads`
 * @see https://docs.nestjs.com/recipes/cqrs#queries
 */
export const QueryHandler = (query: IQuery): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(QUERY_HANDLER_METADATA, query, target);
  };
};
