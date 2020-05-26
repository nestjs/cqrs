import { Subject } from 'rxjs';
import { IQuery, IQueryPublisher } from '../../interfaces';
import { IMessageSource } from "../../interfaces/queries/message-source.interface";

export class DefaultQueriesPubSub<QueryBase extends IQuery = IQuery>
  implements IQueryPublisher<QueryBase>, IMessageSource<QueryBase> {
  private subject$: Subject<QueryBase>;

  publish<T extends QueryBase>(pattern: string, query: T) {
    this.subject$.next(query);
  }

  bridgeQueriesTo<T extends QueryBase>(subject: Subject<T>) {
    this.subject$ = subject;
  }
}
