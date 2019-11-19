import { Observable, Subject } from 'rxjs';

export class ObservableBus<T> extends Observable<T> {
  public subject$ = new Subject<T>();

  constructor() {
    super();
    this.source = this.subject$;
  }
}
