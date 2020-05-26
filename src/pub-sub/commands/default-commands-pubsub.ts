import { Subject } from 'rxjs';
import { ICommand, ICommandPublisher } from '../../interfaces';
import { IMessageSource } from "../../interfaces/commands/message-source.interface";

export class DefaultCommandsPubSub<CommandBase extends ICommand = ICommand>
  implements ICommandPublisher<CommandBase>, IMessageSource<CommandBase> {
  private subject$: Subject<CommandBase>;

  publish<T extends CommandBase>(pattern: string, command: T) {
    this.subject$.next(command);
  }

  bridgeCommandsTo<T extends CommandBase>(subject: Subject<T>) {
    this.subject$ = subject;
  }
}
