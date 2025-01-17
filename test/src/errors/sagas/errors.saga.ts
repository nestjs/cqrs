import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { ofType, Saga } from '../../../../src';
import { UnhandledExceptionEvent } from '../events/unhandled-exception.event';

@Injectable()
export class ErrorsSagas {
  @Saga()
  onError = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(UnhandledExceptionEvent),
      delay(1000),
      mergeMap((event) => {
        if (event.failAt === 'saga') {
          throw new Error(`Unhandled exception in ${event.failAt}`);
        }
        return of();
      }),
    );
  };
}
