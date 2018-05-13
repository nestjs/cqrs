import { Subject, Observable } from 'rxjs';
import { EventObservable } from '../interfaces/event-observable.interface';
export declare class ObservableBus<T> extends Observable<T>
  implements EventObservable<T> {
  protected subject$: Subject<T>;
  constructor();
  ofType(...metatypes: any[]): Observable<T>;
}
