import { Injectable, OnModuleDestroy, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isFunction } from 'util';
import { CommandBus } from './command-bus';
import { EVENTS_HANDLER_METADATA, SAGA_METADATA } from './decorators/constants';
import { InvalidSagaException } from './exceptions';
import { DefaultEventDispatcher } from './helpers/default-event-dispatcher';
import { DefaultPubSub } from './helpers/default-pubsub';
import {
  defaultGetEventName,
  defaultGetEventNameFromType,
} from './helpers/default-event-naming';
import {
  IEvent,
  IEventBus,
  IEventDispatcher,
  IEventHandler,
  IEventPublisher,
  ISaga,
} from './interfaces';
import { ObservableBus } from './utils';

export type EventHandlerType<EventBase extends IEvent = IEvent> = Type<
  IEventHandler<EventBase>
>;

@Injectable()
export class EventBus<EventBase extends IEvent = IEvent>
  extends ObservableBus<EventBase>
  implements IEventBus<EventBase>, OnModuleDestroy {
  protected getEventName: (event: EventBase) => string;
  protected getEventNameFromType: (eventType: Type<EventBase>) => string;
  private _dispatcher: IEventDispatcher<EventBase>;
  protected readonly subscriptions: Subscription[];

  private _publisher: IEventPublisher<EventBase>;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly moduleRef: ModuleRef,
  ) {
    super();
    this.subscriptions = [];
    this.getEventName = defaultGetEventName;
    this.getEventNameFromType = defaultGetEventNameFromType;
    this.useDefaultPublisher();
    this.useDefaultDispatcher();
  }

  get publisher(): IEventPublisher<EventBase> {
    return this._publisher;
  }

  set publisher(_publisher: IEventPublisher<EventBase>) {
    this._publisher = _publisher;
  }

  get dispatcher(): IEventDispatcher<EventBase> {
    return this._dispatcher;
  }

  set dispatcher(_dispatcher: IEventDispatcher<EventBase>) {
    this._dispatcher = _dispatcher;
  }

  onModuleDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  publish<T extends EventBase>(event: T) {
    return this._publisher.publish(event);
  }

  publishAll<T extends EventBase>(events: T[]) {
    if (this._publisher.publishAll) {
      return this._publisher.publishAll(events);
    }
    return (events || []).map((event) => this._publisher.publish(event));
  }

  async bind(handler: IEventHandler<EventBase>, event: Type<EventBase>) {
    const name = this.getEventNameFromType(event);
    const stream$ = name ? this.ofEventName(name) : this.subject$;
    const subscription = (
      await this._dispatcher.processEventBinding(event, handler, stream$)
    ).subscribe((event) => this._dispatcher.fireEventHandler(event, handler));
    this.subscriptions.push(subscription);
  }

  registerSagas(types: Type<unknown>[] = []): Promise<void[]> {
    const sagas = types
      .map((target) => {
        const metadata = Reflect.getMetadata(SAGA_METADATA, target) || [];
        const instance = this.moduleRef.get(target, { strict: false });
        if (!instance) {
          throw new InvalidSagaException();
        }
        return metadata.map((key: string) => instance[key]);
      })
      .reduce((a, b) => a.concat(b), []);

    return Promise.all(sagas.map((saga) => this.registerSaga(saga)));
  }

  register(handlers: EventHandlerType<EventBase>[] = []) {
    return Promise.all(
      handlers.map((handler) => this.registerHandler(handler)),
    );
  }

  protected registerHandler(handler: EventHandlerType<EventBase>) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const eventsNames = this.reflectHandlerEventNames(handler);
    return Promise.all(
      eventsNames.map((event) =>
        this.bind(instance as IEventHandler<EventBase>, event),
      ),
    );
  }

  protected ofEventName(name: string) {
    return this.subject$.pipe(
      filter((event) => this.getEventName(event) === name),
    );
  }

  protected async registerSaga(saga: ISaga<EventBase>) {
    if (!isFunction(saga)) {
      throw new InvalidSagaException();
    }
    const stream$ = saga(this);
    if (!(stream$ instanceof Observable)) {
      throw new InvalidSagaException();
    }

    const subscription = (
      await this._dispatcher.processSaga(stream$)
    ).subscribe((command) =>
      this._dispatcher.fireSagaCommand(command, this.commandBus),
    );

    this.subscriptions.push(subscription);
  }

  private reflectHandlerEventNames(
    handler: EventHandlerType<EventBase>,
  ): Type<EventBase>[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultPubSub<EventBase>(this.subject$);
  }

  private useDefaultDispatcher() {
    this._dispatcher = new DefaultEventDispatcher<EventBase>();
  }
}
