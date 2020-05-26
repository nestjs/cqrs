import { IQueryPublisher } from "./query-publisher.interface";
import { ClientProvider } from "../client-provider.interface";
import { Constructor } from "../../event-publisher";
import { IQuery } from "./query.interface";

export interface IQueriesPubSubOptions<
    PubSub extends IQueryPublisher<QueryBase> = IQueryPublisher<IQuery>,
    QueryBase extends IQuery = IQuery,
> {
    pubSub: Constructor<PubSub>;
    clientProvider: ClientProvider;
}
