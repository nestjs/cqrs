import { Subject } from 'rxjs';
import { Inject } from "@nestjs/common";
import { IQuery, IQueryPublisher } from "../../interfaces";
import { QUERIES_PUBLISHER_CLIENT } from "../../constants";
import { defaultGetEventName } from "../../helpers/default-get-event-name";
import { IPublishableQuery } from "../../interfaces/queries/publishable-query.interface";
import { IMessageSource } from "../../interfaces/queries/message-source.interface";
import { IPubSubClient } from "../../interfaces/pub-sub-client.interface";
import { MessageType } from "../../enums";

export class KafkaQueriesPubSub<QueryBase extends IQuery = IQuery>
    implements IQueryPublisher<QueryBase>, IMessageSource<QueryBase> {

    private subject$: Subject<QueryBase>;

    private subscribedTopics: string[] = [];

    constructor(
        @Inject(QUERIES_PUBLISHER_CLIENT)
        private readonly client: IPubSubClient
    ) {}

    async publish<T extends QueryBase>(pattern: string, queryData: T): Promise<any> {
        if (!this.subscribedTopics.includes(pattern)) {
            this.client.subscribeToResponseOf(pattern);
            this.subscribedTopics.push(pattern);
        }

        const query: IPublishableQuery<T> = {
            messageType: MessageType.MESSAGE_TYPE_QUERY,
            payloadType: defaultGetEventName(queryData),
            data: queryData,
            timestamp: new Date().getTime(),
        };

        return this.client.send(pattern, query);
    }

    bridgeQueriesTo<T extends QueryBase>(subject: Subject<T>) {
        this.subject$ = subject;
    }
}
