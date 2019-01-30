import { Observable } from 'rxjs';
import { Type } from '@nestjs/common';

export interface EventObservable<T> {
  ofType(...events: Type<T>[]): Observable<T>;
}
