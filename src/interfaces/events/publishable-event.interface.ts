import { IEvent } from "./event.interface";
import { MessageType } from "../../enums";

export interface IPublishableEvent<EventBase extends IEvent = IEvent> {
    readonly messageType: MessageType;
    readonly payloadType: string;
    readonly timestamp: number;
    data: EventBase;
}
