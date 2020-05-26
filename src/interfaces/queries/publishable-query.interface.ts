import { IQuery } from "./query.interface";
import { MessageType } from "../../enums";

export interface IPublishableQuery<QueryBase extends IQuery = IQuery> {
    readonly messageType: MessageType;
    readonly payloadType: string;
    readonly timestamp: number;
    data: QueryBase;
}
