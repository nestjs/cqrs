import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isFunction } from 'util';
import { CommandBus } from './command-bus';
import { EVENTS_HANDLER_METADATA, SAGA_METADATA } from './decorators/constants';
import { InvalidSagaException } from './exceptions/invalid-saga.exception';
import { DefaultPubSub } from './helpers/default-pubsub';
import { IEventPublisher } from './interfaces/events/event-publisher.interface';
import { IEvent, IEventBus, IEventHandler, ISaga } from './interfaces/index';
import { ObservableBus } from './utils/observable-bus';

export type EventHandlerType = Type<IEventHandler<IEvent>>;

@Injectable()
export class EventBus extends ObservableBus<IEvent> implements IEventBus {
  private _publisher: IEventPublisher;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly moduleRef: ModuleRef,
  ) {
    super();
    this.useDefaultPublisher();
  }

  get publisher(): IEventPublisher {
    return this._publisher;
  }

  set publisher(_publisher: IEventPublisher) {
    this._publisher = _publisher;
  }

  publish<T extends IEvent>(event: T) {
    this._publisher.publish(event);
  }

  bind(handler: IEventHandler<IEvent>, name: string) {
    const stream$ = name ? this.ofEventName(name) : this.subject$;
    stream$.subscribe(event => handler.handle(event));
  }

  registerSagas(types: Type<any>[] = []) {
    const sagas = types
      .map(target => {
        const metadata = Reflect.getMetadata(SAGA_METADATA, target) || [];
        const instance = this.moduleRef.get(target, { strict: false });
        if (!instance) {
          throw new InvalidSagaException();
        }
        return metadata.map((key: string) => instance[key]);
      })
      .reduce((a, b) => a.concat(b), []);

    sagas.forEach(saga => this.registerSaga(saga));
  }

  register(handlers: EventHandlerType[] = []) {
    handlers.forEach(handler => this.registerHandler(handler));
  }

  protected registerHandler(handler: EventHandlerType) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const eventsNames = this.reflectEventsNames(handler);
    eventsNames.map(event =>
      this.bind(instance as IEventHandler<IEvent>, event.name),
    );
  }

  protected ofEventName(name: string) {
    return this.subject$.pipe(
      filter(event => this.getEventName(event) === name),
    );
  }

  private getEventName(event): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }

  protected registerSaga(saga: ISaga) {
    if (!isFunction(saga)) {
      throw new InvalidSagaException();
    }
    const stream$ = saga(this);
    if (!(stream$ instanceof Observable)) {
      throw new InvalidSagaException();
    }
    stream$
      .pipe(filter(e => !!e))
      .subscribe(command => this.commandBus.execute(command));
  }

  private reflectEventsNames(handler: EventHandlerType): FunctionConstructor[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }

  private useDefaultPublisher() {
    const pubSub = new DefaultPubSub();
    pubSub.bridgeEventsTo(this.subject$);
    this._publisher = pubSub;
  }
}
