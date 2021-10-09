import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import 'reflect-metadata';
import { COMMAND_HANDLER_METADATA } from './decorators/constants';
import { CommandHandlerNotFoundException } from './exceptions/command-not-found.exception';
import { DefaultCommandPubSub } from './helpers/default-command-pubsub';
import { InvalidCommandHandlerException } from './index';
import {
  ICommand,
  ICommandBus,
  ICommandHandler,
  ICommandPublisher,
} from './interfaces/index';
import { ObservableBus } from './utils/observable-bus';
import { CommandHandlerAlreadyDefinedException } from './exceptions/command-handler-already-defined.exception';
import { getHandlerName } from './helpers/get-handler-name';

export type CommandHandlerType = Type<ICommandHandler<ICommand>>;

@Injectable()
export class CommandBus<CommandBase extends ICommand = ICommand>
  extends ObservableBus<CommandBase>
  implements ICommandBus<CommandBase>
{
  private handlers = new Map<string, ICommandHandler<CommandBase>>();
  private _publisher: ICommandPublisher<CommandBase>;

  constructor(private readonly moduleRef: ModuleRef) {
    super();
    this.useDefaultPublisher();
  }

  get publisher(): ICommandPublisher<CommandBase> {
    return this._publisher;
  }

  set publisher(_publisher: ICommandPublisher<CommandBase>) {
    this._publisher = _publisher;
  }

  execute<T extends CommandBase, R = any>(command: T): Promise<R> {
    const commandName = this.getCommandName(command as any);
    const handler = this.handlers.get(commandName);
    if (!handler) {
      throw new CommandHandlerNotFoundException(commandName);
    }
    this.subject$.next(command);
    return handler.execute(command);
  }

  bind<T extends CommandBase>(handler: ICommandHandler<T>, name: string) {
    if (this.handlers.has(name)) {
      throw new CommandHandlerAlreadyDefinedException(
        name,
        getHandlerName(handler),
        getHandlerName(this.handlers.get(name)),
      );
    }

    this.handlers.set(name, handler);
  }

  register(handlers: CommandHandlerType[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: CommandHandlerType) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const target = this.reflectCommandName(handler);
    if (!target) {
      throw new InvalidCommandHandlerException();
    }
    this.bind(instance as ICommandHandler<CommandBase>, target.name);
  }

  private getCommandName(command: Function): string {
    const { constructor } = Object.getPrototypeOf(command);
    return constructor.name as string;
  }

  private reflectCommandName(handler: CommandHandlerType): FunctionConstructor {
    return Reflect.getMetadata(COMMAND_HANDLER_METADATA, handler);
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultCommandPubSub<CommandBase>(this.subject$);
  }

  private getHandlerName(instance: ICommandHandler) {
    return (instance as Object).constructor.name;
  }
}
