import { ICommand } from "./command.interface";
import { MessageType } from "../../enums";

export interface IPublishableCommand<CommandBase extends ICommand = ICommand> {
    readonly messageType: MessageType;
    readonly payloadType: string;
    readonly timestamp: number;
    data: CommandBase;
}
