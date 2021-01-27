import { HandlerRegister } from './utils/handler-register';
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
import { getClassName } from './utils';

export type CommandHandlerType = Type<ICommandHandler<ICommand>>;

@Injectable()
export class CommandBus<CommandBase extends ICommand = ICommand>
  extends ObservableBus<CommandBase>
  implements ICommandBus<CommandBase> {
  private handlers = new HandlerRegister<ICommandHandler<ICommand>>(
    this.moduleRef,
    COMMAND_HANDLER_METADATA,
  );
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

  async execute<T extends CommandBase>(command: T): Promise<any> {
    const handler = await this.handlers.get(command);
    if (!handler) {
      throw new CommandHandlerNotFoundException(getClassName(command));
    }
    this.subject$.next(command);
    return handler.execute(command);
  }

  register(handlers: CommandHandlerType[] = []): void {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: CommandHandlerType): void {
    if (!this.handlers.registerHandler(handler)) {
      throw new InvalidCommandHandlerException();
    }
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultCommandPubSub<CommandBase>(this.subject$);
  }
}
