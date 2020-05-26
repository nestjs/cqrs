import { Subject } from 'rxjs';
import { Inject } from "@nestjs/common";
import { ICommand, ICommandPublisher } from "../../interfaces";
import { COMMANDS_PUBLISHER_CLIENT } from "../../constants";
import { defaultGetEventName } from "../../helpers/default-get-event-name";
import { IMessageSource } from "../../interfaces/commands/message-source.interface";
import { IPubSubClient } from "../../interfaces/pub-sub-client.interface";
import { IPublishableCommand } from "../../interfaces/commands/publishable-command.interface";
import { MessageType } from "../../enums";

export class KafkaCommandsPubSub<CommandBase extends ICommand = ICommand>
    implements ICommandPublisher<CommandBase>, IMessageSource<CommandBase> {

    private subject$: Subject<CommandBase>;

    private subscribedTopics: string[] = [];

    constructor(
        @Inject(COMMANDS_PUBLISHER_CLIENT)
        private readonly client: IPubSubClient
    ) {}

    async publish<T extends CommandBase>(pattern: string, commandData: T): Promise<any> {
        if (!this.subscribedTopics.includes(pattern)) {
            this.client.subscribeToResponseOf(pattern);
            this.subscribedTopics.push(pattern);
        }

        const command: IPublishableCommand<T> = {
            messageType: MessageType.MESSAGE_TYPE_COMMAND,
            payloadType: defaultGetEventName(commandData),
            data: commandData,
            timestamp: new Date().getTime(),
        };

        return this.client.send(pattern, command);
    }

    bridgeCommandsTo<T extends CommandBase>(subject: Subject<T>) {
        this.subject$ = subject;
    }
}
