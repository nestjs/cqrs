import { ICommand } from './command.interface';
import { Subject } from "rxjs";

export interface ICommandPublisher<CommandBase extends ICommand = ICommand> {
  publish<T extends CommandBase = CommandBase>(pattern: string, command: T): any;
  bridgeCommandsTo<T extends CommandBase>(subject: Subject<T>);
}
