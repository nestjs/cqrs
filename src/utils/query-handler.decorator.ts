import 'reflect-metadata';
import { IQuery, IQueryResult } from '../interfaces';
import { QUERY_HANDLER_METADATA } from './constants';

export const QueryHandler = (query: IQuery<IQueryResult>): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(QUERY_HANDLER_METADATA, query, target);
  };
};
