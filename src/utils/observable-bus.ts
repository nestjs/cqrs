import { Subject, Observable } from 'rxjs';
import { EventObservable } from '../interfaces/event-observable.interface';
import { filter } from 'rxjs/operators';

const isEmpty = array => !(array && array.length > 0);

export class ObservableBus<T> extends Observable<T>
  implements EventObservable<T> {
  protected subject$ = new Subject<T>();

  constructor() {
    super();
    this.source = this.subject$ as any;
  }

  ofType(...metatypes): Observable<T> {
    return this.pipe(
      filter(
        event =>
          !isEmpty(metatypes.filter(metatype => event instanceof metatype)),
      ),
    );
  }
}
