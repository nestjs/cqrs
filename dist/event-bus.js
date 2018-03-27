"use strict";
var __decorate =
  (this && this.__decorate) ||
  function(decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, "__esModule", { value: true });
const observable_bus_1 = require("./utils/observable-bus");
const common_1 = require("@nestjs/common");
const Observable_1 = require("rxjs/Observable");
const command_bus_1 = require("./command-bus");
const invalid_saga_exception_1 = require("./exceptions/invalid-saga.exception");
const constants_1 = require("./utils/constants");
const index_1 = require("./index");
require("rxjs/add/operator/filter");
let EventBus = class EventBus extends observable_bus_1.ObservableBus {
  constructor(commandBus) {
    super();
    this.commandBus = commandBus;
    this.moduleRef = null;
  }
  setModuleRef(moduleRef) {
    this.moduleRef = moduleRef;
  }
  publish(event) {
    this.subject$.next(event);
  }
  ofType(event) {
    return this.ofEventName(event.name);
  }
  bind(handler, name) {
    const stream$ = name ? this.ofEventName(name) : this.subject$;
    stream$.subscribe(event => handler.handle(event));
  }
  combineSagas(sagas) {
    [].concat(sagas).map(saga => this.registerSaga(saga));
  }
  register(handlers) {
    handlers.forEach(handler => this.registerHandler(handler));
  }
  registerHandler(handler) {
    if (!this.moduleRef) {
      throw new index_1.InvalidModuleRefException();
    }
    const instance = this.moduleRef.get(handler);
    if (!instance) return;
    const eventsNames = this.reflectEventsNames(handler);
    eventsNames.map(event => this.bind(instance, event.name));
  }
  ofEventName(name) {
    return this.subject$.filter(event => this.getEventName(event) === name);
  }
  getEventName(event) {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name;
  }
  registerSaga(saga) {
    const stream$ = saga(this);
    if (!(stream$ instanceof Observable_1.Observable)) {
      throw new invalid_saga_exception_1.InvalidSagaException();
    }
    stream$
      .filter(e => !!e)
      .subscribe(command => this.commandBus.execute(command));
  }
  reflectEventsNames(handler) {
    return Reflect.getMetadata(constants_1.EVENTS_HANDLER_METADATA, handler);
  }
};
EventBus = __decorate(
  [
    common_1.Component(),
    __metadata("design:paramtypes", [command_bus_1.CommandBus])
  ],
  EventBus
);
exports.EventBus = EventBus;
