import { Subject, Observable } from 'rxjs';
import { EventObservable } from '../interfaces/event-observable.interface';
import { filter } from 'rxjs/operators';
import { Type } from '@nestjs/common';

const isEmpty = array => !(array && array.length > 0);

export class ObservableBus<T> extends Observable<T>
  implements EventObservable<T> {
  protected subject$ = new Subject<T>();

  constructor() {
    super();
    this.source = this.subject$ as any;
  }

  ofType(...types: Type<any>[]): Observable<T> {
    return this.pipe(
      filter(event => !isEmpty(types.filter(type => event instanceof type))),
    );
  }
}
