import { IPublishableEvent } from "./events/publishable-event.interface";
import { IPublishableQuery } from "./queries/publishable-query.interface";
import { IPublishableCommand } from "./commands/publishable-command.interface";

export declare type IncomingMessage = IPublishableEvent | IPublishableQuery | IPublishableCommand;
