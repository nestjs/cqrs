import { Inject, Injectable, Optional, Type } from '@nestjs/common';
import 'reflect-metadata';
import { Observable, filter } from 'rxjs';
import { CQRS_MODULE_OPTIONS } from './constants';
import { DefaultUnhandledExceptionPubSub } from './helpers/default-unhandled-exception-pubsub';
import {
  CqrsModuleOptions,
  ICommand,
  IEvent,
  IUnhandledExceptionPublisher,
  UnhandledExceptionInfo,
} from './interfaces';
import { ObservableBus } from './utils/observable-bus';

/**
 * A bus that publishes unhandled exceptions.
 * @template Cause The type of the cause of the exception.
 */
@Injectable()
export class UnhandledExceptionBus<
  Cause = IEvent | ICommand,
> extends ObservableBus<UnhandledExceptionInfo<Cause>> {
  private _publisher: IUnhandledExceptionPublisher<Cause>;

  constructor(
    @Optional()
    @Inject(CQRS_MODULE_OPTIONS)
    private readonly options?: CqrsModuleOptions,
  ) {
    super();

    if (this.options?.unhandledExceptionPublisher) {
      this._publisher = this.options
        .unhandledExceptionPublisher as IUnhandledExceptionPublisher<Cause>;
    } else {
      this.useDefaultPublisher();
    }
  }

  /**
   * Filter values depending on their instance type (comparison is made
   * using native `instanceof`).
   *
   * @param types List of types to filter by.
   * @return A stream only emitting the filtered exceptions.
   */
  static ofType<
    TInput extends IEvent | ICommand,
    TOutput extends IEvent | ICommand,
  >(...types: Type<TOutput>[]) {
    const isInstanceOf = (
      exceptionInfo: UnhandledExceptionInfo,
    ): exceptionInfo is UnhandledExceptionInfo<TOutput> =>
      !!types.find((classType) => exceptionInfo.exception instanceof classType);

    return (
      source: Observable<UnhandledExceptionInfo<TInput>>,
    ): Observable<UnhandledExceptionInfo<TOutput>> =>
      source.pipe(filter(isInstanceOf));
  }

  /**
   * Gets the publisher of the bus.
   */
  get publisher(): IUnhandledExceptionPublisher<Cause> {
    return this._publisher;
  }

  /**
   * Sets the publisher of the bus.
   */
  set publisher(_publisher: IUnhandledExceptionPublisher<Cause>) {
    this._publisher = _publisher;
  }

  /**
   * Publishes an unhandled exception.
   * @param info The exception information.
   */
  publish(info: UnhandledExceptionInfo<Cause>) {
    return this._publisher.publish(info);
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultUnhandledExceptionPubSub<Cause>(this.subject$);
  }
}
