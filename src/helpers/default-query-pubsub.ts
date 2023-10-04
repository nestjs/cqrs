import { Subject } from 'rxjs';
import { IQuery, IQueryPublisher } from '../interfaces';

export class DefaultQueryPubSub<QueryBase extends IQuery>
  implements IQueryPublisher<QueryBase>
{
  constructor(private subject$: Subject<QueryBase>) {}

  publish<T extends QueryBase>(query: T) {
    this.subject$.next(query);
  }
}
