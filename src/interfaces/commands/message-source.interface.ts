import { Subject } from 'rxjs';
import { ICommand } from "./command.interface";

export interface IMessageSource<CommandBase extends ICommand = ICommand> {
  bridgeCommandsTo<T extends CommandBase>(subject: Subject<T>): any;
}
