import { Injectable } from "@nestjs/common";
import { MessageWithoutTypeException } from "../exceptions/message-without-type.exception";
import { ExplorerService } from "./explorer.service";
import { IncomingMessage } from "../interfaces/incoming-message.interface";
import { Constructor } from "../event-publisher";
import { EventBus } from "../event-bus";
import { QueryBus } from "../query-bus";
import { CommandBus } from "../command-bus";
import { MessageType } from "../enums";

@Injectable()
export class PropagationService {

    private readonly dispatchers: Map<MessageType, (payload: any) => any> = new Map([
        [MessageType.MESSAGE_TYPE_EVENT, this.eventBus.publishLocally.bind(this.eventBus)],
        [MessageType.MESSAGE_TYPE_QUERY, this.queryBus.executeLocally.bind(this.queryBus)],
        [MessageType.MESSAGE_TYPE_COMMAND, this.commandBus.executeLocally.bind(this.commandBus)],
    ]);

    constructor(
        private readonly explorerService: ExplorerService,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    async propagate(message: IncomingMessage): Promise<any> {
        if (!this.isValid(message)) {
            throw new MessageWithoutTypeException(message);
        }

        return this.getInternalOccurrences()
            .filter((Ctor) => Ctor?.name === message.payloadType)
            .map((Ctor) => new Ctor(...[message.data]))
            .map((payloadInst) => this.dispatchers.get(message.messageType)?.(payloadInst))
            .find(() => true); // first existing element
    }

    private getInternalOccurrences(): Constructor<any>[] {
        const { commandDtos, eventDtos, queryDtos } = this.explorerService.explore();
        return [
            ...commandDtos,
            ...eventDtos,
            ...queryDtos,
        ];
    }

    private isValid(message: IncomingMessage): boolean {
        return !(!message || !message.messageType || !message.payloadType);
    }
}
