import { IQuery } from './query.interface';
import { Subject } from "rxjs";

export interface IQueryPublisher<QueryBase extends IQuery = IQuery> {
  publish<T extends QueryBase = QueryBase>(pattern: string, query: T): any;
  bridgeQueriesTo<T extends QueryBase>(subject: Subject<T>);
}
