import {IEvent} from "./event.interface";
import {Subject} from "rxjs/Subject";

export interface IMessageSource {
    bridgeEventsTo<T extends IEvent>(subject: Subject<T>);
}
