import {IEvent} from "./event.interface";
import {Subject} from "rxjs/Subject";

export interface IEventPublisher {
    publish<T extends IEvent>(event: T);
}
