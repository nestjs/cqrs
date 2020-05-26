import { IEvent } from "./event.interface";
import { IPublishableEvent } from "./publishable-event.interface";

export interface IKafkaHeaders {
    [key: string]: Buffer;
}

export interface IKafkaMessage<EventBase extends IEvent = IEvent> {
    key?: Buffer | string | null;
    payloadType: string;
    messageType: string;
    value: IPublishableEvent<EventBase>;
    partition?: number;
    headers?: IKafkaHeaders;
    timestamp?: string;
}
