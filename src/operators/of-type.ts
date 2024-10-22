import { Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IEvent } from '../interfaces';

/**
 * Filter values depending on their instance type (comparison is made
 * using native `instanceof`).
 *
 * @param types List of types implementing `IEvent`.
 *
 * @return A stream only emitting the filtered instances.
 */
export function ofType<TInput extends IEvent, T extends Type<IEvent>[]>(
  ...types: T
) {
  type InstanceOf<T> = T extends Type<infer I> ? I : never;
  const isInstanceOf = (event: IEvent): event is InstanceOf<T[number]> =>
    !!types.find((classType) => event instanceof classType);

  return (source: Observable<TInput>): Observable<InstanceOf<T[number]>> =>
    source.pipe(filter(isInstanceOf));
}
