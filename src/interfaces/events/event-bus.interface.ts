import { IEvent } from './event.interface';
import {EventHandlerMetatype} from "../../event-bus";

export interface IEventBus {
    publish<T extends IEvent>(event: T);
    register(handlers: EventHandlerMetatype[]);
}