import { Observable, Subject } from 'rxjs';

export class ObservableBus<T> extends Observable<T> {
  private _subject$ = new Subject<T>();

  constructor() {
    super();
    this.source = this._subject$;
  }

  public get subject$() {
    return this._subject$;
  }
}
