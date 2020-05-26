import { Subject } from 'rxjs';
import { IQuery } from "./query.interface";

export interface IMessageSource<QueryBase extends IQuery = IQuery> {
  bridgeQueriesTo<T extends QueryBase>(subject: Subject<T>): any;
}
