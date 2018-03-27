import { Observable } from "rxjs/Observable";
export interface EventObservable<T> {
  ofType(...events: any[]): Observable<T>;
}
