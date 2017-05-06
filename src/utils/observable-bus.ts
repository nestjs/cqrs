import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { EventObservable } from '../interfaces/event-observable.interface';
import 'rxjs/add/operator/filter';

const isEmpty = (array) => !(array && array.length > 0);

export class ObservableBus<T> extends Observable<T> implements EventObservable<T> {
    protected subject$ = new Subject<T>();

    constructor() {
        super();
        this.source = this.subject$;
    }

    ofType(...metatypes): Observable<T> {
        return this.filter(event => !isEmpty(metatypes.filter(metatype => event instanceof metatype)));
    }
}