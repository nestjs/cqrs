import { Observable } from 'rxjs/Observable';

export interface EventObservable<T> {
    ofType(...events): Observable<T>;
}