import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { EventObservable } from '../interfaces/event-observable.interface';
import 'rxjs/add/operator/filter';
export declare class ObservableBus<T> extends Observable<T>
  implements EventObservable<T> {
  protected subject$: Subject<T>;
  constructor();
  ofType(...metatypes: any[]): Observable<T>;
}
