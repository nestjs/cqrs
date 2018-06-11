import { Observable } from 'rxjs';

export interface EventObservable<T> {
  ofType(...events): Observable<T>;
}
