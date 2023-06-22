import { Injectable, Logger, OnModuleDestroy, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable, Subscription, defer, throwError } from 'rxjs';
import { catchError, filter, mergeMap } from 'rxjs/operators';
import { CommandBus } from './command-bus';
import { EVENTS_HANDLER_METADATA, SAGA_METADATA } from './decorators/constants';
import { InvalidSagaException } from './exceptions';
import {
  defaultGetEventId,
  defaultReflectEventId,
} from './helpers/default-get-event-id';
import { DefaultPubSub } from './helpers/default-pubsub';
import {
  ICommand,
  IEvent,
  IEventBus,
  IEventHandler,
  IEventPublisher,
  ISaga,
  UnhandledExceptionInfo,
} from './interfaces';
import { UnhandledExceptionBus } from './unhandled-exception-bus';
import { ObservableBus } from './utils';

export type EventHandlerType<EventBase extends IEvent = IEvent> = Type<
  IEventHandler<EventBase>
>;

@Injectable()
export class EventBus<EventBase extends IEvent = IEvent>
  extends ObservableBus<EventBase>
  implements IEventBus<EventBase>, OnModuleDestroy
{
  protected getEventId: (event: EventBase) => string | null;
  protected readonly subscriptions: Subscription[];

  private _publisher: IEventPublisher<EventBase>;
  private readonly _logger = new Logger(EventBus.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly moduleRef: ModuleRef,
    private readonly unhandledExceptionBus: UnhandledExceptionBus,
  ) {
    super();
    this.subscriptions = [];
    this.getEventId = defaultGetEventId;
    this.useDefaultPublisher();
  }

  /**
   * Returns the publisher.
   * Default publisher is `DefaultPubSub` (in memory).
   */
  get publisher(): IEventPublisher<EventBase> {
    return this._publisher;
  }

  /**
   * Sets the publisher.
   * Default publisher is `DefaultPubSub` (in memory).
   * @param _publisher The publisher to set.
   */
  set publisher(_publisher: IEventPublisher<EventBase>) {
    this._publisher = _publisher;
  }

  onModuleDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  /**
   * Publishes an event.
   * @param event The event to publish.
   */
  publish<T extends EventBase>(event: T) {
    return this._publisher.publish(event);
  }

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   */
  publishAll<T extends EventBase>(events: T[]) {
    if (this._publisher.publishAll) {
      return this._publisher.publishAll(events);
    }
    return (events || []).map((event) => this._publisher.publish(event));
  }

  bind(handler: IEventHandler<EventBase>, id: string) {
    const stream$ = id ? this.ofEventId(id) : this.subject$;
    const subscription = stream$
      .pipe(
        mergeMap((event) =>
          defer(() => Promise.resolve(handler.handle(event))).pipe(
            catchError((error) =>
              throwError(() => this.mapToUnhandledErrorInfo(event, error)),
            ),
          ),
        ),
      )
      .subscribe({
        error: (error) => {
          if (this.isUnhandledErrorInfo(error)) {
            this.unhandledExceptionBus.publish(error);
            error = error.exception;
          }
          this._logger.error(
            `"${handler.constructor.name}" has thrown an unhandled exception.`,
            error,
          );
        },
      });
    this.subscriptions.push(subscription);
  }

  registerSagas(types: Type<unknown>[] = []) {
    const sagas = types
      .map((target) => {
        const metadata = Reflect.getMetadata(SAGA_METADATA, target) || [];
        const instance = this.moduleRef.get(target, { strict: false });
        if (!instance) {
          throw new InvalidSagaException();
        }
        return metadata.map((key: string) => instance[key].bind(instance));
      })
      .reduce((a, b) => a.concat(b), []);

    sagas.forEach((saga) => this.registerSaga(saga));
  }

  register(handlers: EventHandlerType<EventBase>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: EventHandlerType<EventBase>) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const events = this.reflectEvents(handler);
    events.map((event) =>
      this.bind(
        instance as IEventHandler<EventBase>,
        defaultReflectEventId(event),
      ),
    );
  }

  protected ofEventId(id: string) {
    return this.subject$.pipe(filter((event) => this.getEventId(event) === id));
  }

  protected registerSaga(saga: ISaga<EventBase>) {
    if (typeof saga !== 'function') {
      throw new InvalidSagaException();
    }
    const stream$ = saga(this);
    if (!(stream$ instanceof Observable)) {
      throw new InvalidSagaException();
    }

    const subscription = stream$
      .pipe(
        filter((e) => !!e),
        mergeMap((command) =>
          defer(() => this.commandBus.execute(command)).pipe(
            catchError((error) =>
              throwError(() => this.mapToUnhandledErrorInfo(command, error)),
            ),
          ),
        ),
      )
      .subscribe({
        error: (error) => {
          if (this.isUnhandledErrorInfo(error)) {
            this.unhandledExceptionBus.publish(error);
            error = error.exception;
          }
          this._logger.error(
            `Command handler which execution was triggered by Saga has thrown an unhandled exception.`,
            error,
          );
        },
      });

    this.subscriptions.push(subscription);
  }

  private reflectEvents(
    handler: EventHandlerType<EventBase>,
  ): FunctionConstructor[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultPubSub<EventBase>(this.subject$);
  }

  private mapToUnhandledErrorInfo(
    eventOrCommand: IEvent | ICommand,
    exception: unknown,
  ): UnhandledExceptionInfo {
    return {
      cause: eventOrCommand,
      exception,
    };
  }

  private isUnhandledErrorInfo(
    error: unknown,
  ): error is UnhandledExceptionInfo {
    return (
      typeof error === 'object' &&
      error !== null &&
      'cause' in error &&
      'exception' in error
    );
  }
}
