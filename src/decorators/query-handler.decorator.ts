import 'reflect-metadata';
import { IQuery, IQueryResult } from '../interfaces';
import { QUERY_HANDLER_METADATA } from './constants';

export const QueryHandler = <TResult extends IQueryResult = any>(query: IQuery<TResult>): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(QUERY_HANDLER_METADATA, query, target);
  };
};
