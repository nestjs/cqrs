import {IEvent} from "../interfaces";
import {Subject} from "rxjs/Subject";
import {IEventPublisher} from "../interfaces/events/event-publisher.interface";
import {IMessageSource} from "../interfaces/events/message-source.interface";

export class DefaultPubSub implements IEventPublisher, IMessageSource {
    private subject$: Subject<any>;

    publish<T extends IEvent>(event: T) {
        this.subject$.next(event);
    }

    bridgeEventsTo<T extends IEvent>(subject: Subject<T>) {
        this.subject$ = subject;
    }
}
