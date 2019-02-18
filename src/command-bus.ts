import { Injectable, Type } from '@nestjs/common';
import 'reflect-metadata';
import { CommandHandlerNotFoundException } from './exceptions/command-not-found.exception';
import {
  InvalidCommandHandlerException,
  InvalidModuleRefException,
} from './index';
import { ICommand, ICommandBus, ICommandHandler } from './interfaces/index';
import { COMMAND_HANDLER_METADATA } from './utils/constants';
import { ObservableBus } from './utils/observable-bus';

export type CommandHandlerType = Type<ICommandHandler<ICommand>>;

@Injectable()
export class CommandBus extends ObservableBus<ICommand> implements ICommandBus {
  private handlers = new Map<string, ICommandHandler<ICommand>>();
  private moduleRef = null;

  setModuleRef(moduleRef) {
    this.moduleRef = moduleRef;
  }

  execute<T extends ICommand>(command: T): Promise<any> {
    const handler = this.handlers.get(this.getCommandName(command));
    if (!handler) {
      throw new CommandHandlerNotFoundException();
    }
    this.subject$.next(command);
    return handler.execute(command);
  }

  bind<T extends ICommand>(handler: ICommandHandler<T>, name: string) {
    this.handlers.set(name, handler);
  }

  register(handlers: CommandHandlerType[]) {
    handlers.forEach(handler => this.registerHandler(handler));
  }

  protected registerHandler(handler: CommandHandlerType) {
    if (!this.moduleRef) {
      throw new InvalidModuleRefException();
    }
    const instance = this.moduleRef.get(handler);
    if (!instance) return;

    const target = this.reflectCommandName(handler);
    if (!target) {
      throw new InvalidCommandHandlerException();
    }
    this.bind(instance as ICommandHandler<ICommand>, target.name);
  }

  private getCommandName(command): string {
    const { constructor } = Object.getPrototypeOf(command);
    return constructor.name as string;
  }

  private reflectCommandName(handler: CommandHandlerType): FunctionConstructor {
    return Reflect.getMetadata(COMMAND_HANDLER_METADATA, handler);
  }
}
