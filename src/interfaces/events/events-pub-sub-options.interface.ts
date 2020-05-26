import { IEvent } from "./event.interface";
import { IEventPublisher } from "./event-publisher.interface";
import { ClientProvider } from "../client-provider.interface";
import { Constructor } from "../../event-publisher";

export interface IEventsPubSubOptions<
    PubSub extends IEventPublisher<EventBase> = IEventPublisher<IEvent>,
    EventBase extends IEvent = IEvent,
> {
    pubSub: Constructor<PubSub>,
    clientProvider: ClientProvider,
}
