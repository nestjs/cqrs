import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  Optional,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Observable, Subscription, defer, of } from 'rxjs';
import { catchError, filter, mergeMap } from 'rxjs/operators';
import { CommandBus } from './command-bus';
import { CQRS_MODULE_OPTIONS } from './constants';
import { EVENTS_HANDLER_METADATA, SAGA_METADATA } from './decorators/constants';
import {
  InvalidSagaException,
  UnsupportedSagaScopeException,
} from './exceptions';
import { defaultEventIdProvider } from './helpers/default-event-id-provider';
import { DefaultPubSub } from './helpers/default-pubsub';
import {
  CqrsModuleOptions,
  EventIdProvider,
  ICommand,
  IEvent,
  IEventBus,
  IEventHandler,
  IEventPublisher,
  ISaga,
  UnhandledExceptionInfo,
} from './interfaces';
import { AsyncContext } from './scopes';
import { UnhandledExceptionBus } from './unhandled-exception-bus';
import { ObservableBus } from './utils';

export type EventHandlerType<EventBase extends IEvent = IEvent> = Type<
  IEventHandler<EventBase>
>;

/**
 * @publicApi
 */
@Injectable()
export class EventBus<EventBase extends IEvent = IEvent>
  extends ObservableBus<EventBase>
  implements IEventBus<EventBase>, OnModuleDestroy
{
  protected eventIdProvider: EventIdProvider<EventBase>;
  protected readonly subscriptions: Subscription[];

  private _publisher: IEventPublisher<EventBase>;
  private readonly _logger = new Logger(EventBus.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly moduleRef: ModuleRef,
    private readonly unhandledExceptionBus: UnhandledExceptionBus,
    @Optional()
    @Inject(CQRS_MODULE_OPTIONS)
    private readonly options?: CqrsModuleOptions,
  ) {
    super();
    this.subscriptions = [];
    this.eventIdProvider =
      this.options?.eventIdProvider ?? defaultEventIdProvider;

    if (this.options?.eventPublisher) {
      this._publisher = this.options.eventPublisher;
    } else {
      this.useDefaultPublisher();
    }
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
  publish<TEvent extends EventBase>(event: TEvent): any;
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param asyncContext Async context
   */
  publish<TEvent extends EventBase>(
    event: TEvent,
    asyncContext: AsyncContext,
  ): any;
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param dispatcherContext Dispatcher context
   */
  publish<TEvent extends EventBase, TContext = unknown>(
    event: TEvent,
    dispatcherContext: TContext,
  ): any;
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param dispatcherContext Dispatcher context
   * @param asyncContext Async context
   */
  publish<TEvent extends EventBase, TContext = unknown>(
    event: TEvent,
    dispatcherContext: TContext,
    asyncContext: AsyncContext,
  ): any;
  /**
   * Publishes an event.
   * @param event The event to publish.
   * @param dispatcherOrAsyncContext Dispatcher context or async context
   * @param asyncContext Async context
   */
  publish<TEvent extends EventBase, TContext = unknown>(
    event: TEvent,
    dispatcherOrAsyncContext?: TContext | AsyncContext,
    asyncContext?: AsyncContext,
  ) {
    if (!asyncContext && dispatcherOrAsyncContext instanceof AsyncContext) {
      asyncContext = dispatcherOrAsyncContext;
      dispatcherOrAsyncContext = undefined;
    }

    if (asyncContext) {
      asyncContext.attachTo(event);
    }

    return this._publisher.publish(
      event,
      dispatcherOrAsyncContext,
      asyncContext,
    );
  }

  /**
   * Publishes multiple events.
   * @param events The events to publish.
   */
  publishAll<TEvent extends EventBase>(events: TEvent[]): any;
  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param asyncContext Async context
   */
  publishAll<TEvent extends EventBase>(
    events: TEvent[],
    asyncContext: AsyncContext,
  ): any;
  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param dispatcherContext Dispatcher context
   */
  publishAll<TEvent extends EventBase, TContext = unknown>(
    events: TEvent[],
    dispatcherContext: TContext,
  ): any;
  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param dispatcherContext Dispatcher context
   * @param asyncContext Async context
   */
  publishAll<TEvent extends EventBase, TContext = unknown>(
    events: TEvent[],
    dispatcherContext: TContext,
    asyncContext: AsyncContext,
  ): any;
  /**
   * Publishes multiple events.
   * @param events The events to publish.
   * @param dispatcherOrAsyncContext Dispatcher context or async context
   * @param asyncContext Async context
   */
  publishAll<TEvent extends EventBase, TContext = unknown>(
    events: TEvent[],
    dispatcherOrAsyncContext?: TContext | AsyncContext,
    asyncContext?: AsyncContext,
  ) {
    if (!asyncContext && dispatcherOrAsyncContext instanceof AsyncContext) {
      asyncContext = dispatcherOrAsyncContext;
      dispatcherOrAsyncContext = undefined;
    }

    if (asyncContext) {
      events.forEach((event) => {
        if (AsyncContext.isAttached(event)) {
          return;
        }
        asyncContext.attachTo(event);
      });
    }

    if (this._publisher.publishAll) {
      return this._publisher.publishAll(
        events,
        dispatcherOrAsyncContext,
        asyncContext,
      );
    }
    return (events || []).map((event) =>
      this._publisher.publish(event, dispatcherOrAsyncContext, asyncContext),
    );
  }

  bind(handler: InstanceWrapper<IEventHandler<EventBase>>, id: string) {
    const stream$ = id ? this.ofEventId(id) : this.subject$;

    const deferred = handler.isDependencyTreeStatic()
      ? (event: EventBase) => () => {
          return Promise.resolve(handler.instance.handle(event));
        }
      : (event: EventBase) => async () => {
          const asyncContext = AsyncContext.of(event) ?? new AsyncContext();
          const instance = await this.moduleRef.resolve(
            handler.metatype!,
            asyncContext.id,
            {
              strict: false,
            },
          );
          return instance.handle(event);
        };

    const subscription = stream$
      .pipe(
        mergeMap((event) =>
          defer(deferred(event)).pipe(
            catchError((error) => {
              if (this.options?.rethrowUnhandled) {
                throw error;
              }
              const unhandledError = this.mapToUnhandledErrorInfo(event, error);
              this.unhandledExceptionBus.publish(unhandledError);
              this._logger.error(
                `"${handler.constructor.name}" has thrown an unhandled exception.`,
                error,
              );
              return of();
            }),
          ),
        ),
      )
      .subscribe();
    this.subscriptions.push(subscription);
  }

  registerSagas(wrappers: InstanceWrapper<object>[] = []) {
    const sagas = wrappers
      .map((wrapper) => {
        const { metatype: target } = wrapper;
        const metadata = Reflect.getMetadata(SAGA_METADATA, target!) ?? [];

        if (!wrapper.isDependencyTreeStatic()) {
          throw new UnsupportedSagaScopeException();
        }
        const instance = wrapper.instance;
        return metadata.map((key: string) => {
          const sagaFn = instance[key].bind(instance);
          Object.defineProperty(sagaFn, 'name', {
            value: key,
            writable: false,
            configurable: false,
          });

          return sagaFn;
        });
      })
      .reduce((a, b) => a.concat(b), [] as ISaga<EventBase>[]);

    sagas.forEach((saga: ISaga<EventBase>) => this.registerSaga(saga));
  }

  register(handlers: InstanceWrapper<IEventHandler<EventBase>>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(
    handler: InstanceWrapper<IEventHandler<EventBase>>,
  ) {
    const typeRef = (
      handler.metatype || handler.inject
        ? handler.instance?.constructor
        : handler.metatype
    ) as Type<IEventHandler<EventBase>>;

    const events = this.reflectEvents(typeRef);
    events.forEach((event) => {
      const eventId = this.eventIdProvider.getEventId(event);
      this.bind(handler, eventId!);
    });
  }

  protected ofEventId(id: string) {
    return this.subject$.pipe(
      filter((event) => {
        const { constructor } = Object.getPrototypeOf(event);
        if (!constructor) {
          return false;
        }
        return this.eventIdProvider.getEventId(constructor) === id;
      }),
    );
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
        catchError((error) => {
          if (this.options?.rethrowUnhandled) {
            throw error;
          }

          const unhandledError = this.mapToUnhandledErrorInfo(saga.name, error);
          this.unhandledExceptionBus.publish(unhandledError);
          this._logger.error(
            `Saga "${saga.name}" has thrown an unhandled exception.`,
            error,
          );
          return of();
        }),
        mergeMap((command) =>
          defer(() => this.commandBus.execute(command)).pipe(
            catchError((error) => {
              if (this.options?.rethrowUnhandled) {
                throw error;
              }

              const unhandledError = this.mapToUnhandledErrorInfo(
                command,
                error,
              );
              this.unhandledExceptionBus.publish(unhandledError);
              this._logger.error(
                `Command handler which execution was triggered by Saga has thrown an unhandled exception.`,
                error,
              );
              return of();
            }),
          ),
        ),
      )
      .subscribe();

    this.subscriptions.push(subscription);
  }

  private reflectEvents(
    handler: EventHandlerType<EventBase>,
  ): Type<EventBase>[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultPubSub<EventBase>(this.subject$);
  }

  private mapToUnhandledErrorInfo(
    eventOrCommand: IEvent | ICommand | string,
    exception: unknown,
  ): UnhandledExceptionInfo {
    return {
      cause: eventOrCommand,
      exception,
    };
  }
}
