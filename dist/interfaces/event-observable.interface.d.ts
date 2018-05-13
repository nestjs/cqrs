import { Observable } from 'rxjs';
export interface EventObservable<T> {
  ofType(...events: any[]): Observable<T>;
}
