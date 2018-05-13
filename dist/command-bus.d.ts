import 'reflect-metadata';
import { Type } from '@nestjs/common';
import { ICommandBus, ICommand, ICommandHandler } from './interfaces/index';
import { ObservableBus } from './utils/observable-bus';
export declare type CommandHandlerMetatype = Type<ICommandHandler<ICommand>>;
export declare class CommandBus extends ObservableBus<ICommand>
  implements ICommandBus {
  private handlers;
  private moduleRef;
  setModuleRef(moduleRef: any): void;
  execute<T extends ICommand>(command: T): Promise<any>;
  bind<T extends ICommand>(handler: ICommandHandler<T>, name: string): void;
  register(handlers: CommandHandlerMetatype[]): void;
  protected registerHandler(handler: CommandHandlerMetatype): void;
  private getCommandName(command);
  private reflectCommandName(handler);
}
