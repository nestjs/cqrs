import { ClientProvider } from "../client-provider.interface";
import { ICommandPublisher } from "./command-publisher.interface";
import { Constructor } from "../../event-publisher";
import { ICommand } from "./command.interface";

export interface ICommandsPubSubOptions<
    PubSub extends ICommandPublisher<CommandBase> = ICommandPublisher<ICommand>,
    CommandBase extends ICommand = ICommand,
> {
    pubSub: Constructor<PubSub>;
    clientProvider: ClientProvider;
}
