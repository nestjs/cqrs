import { Inject, Injectable, Logger, Optional, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import 'reflect-metadata';
import { Command } from './classes';
import { CQRS_MODULE_OPTIONS } from './constants';
import {
  COMMAND_HANDLER_METADATA,
  COMMAND_METADATA,
} from './decorators/constants';
import { CommandHandlerNotFoundException } from './exceptions/command-not-found.exception';
import { DefaultCommandPubSub } from './helpers/default-command-pubsub';
import { InvalidCommandHandlerException } from './index';
import { CommandMetadata } from './interfaces/commands/command-metadata.interface';
import {
  CqrsModuleOptions,
  ICommand,
  ICommandBus,
  ICommandHandler,
  ICommandPublisher,
} from './interfaces/index';
import { AsyncContext } from './scopes/async.context';
import { ObservableBus } from './utils/observable-bus';

export type CommandHandlerType<T extends ICommand = ICommand> = Type<
  ICommandHandler<T>
>;

/**
 * @publicApi
 */
@Injectable()
export class CommandBus<CommandBase extends ICommand = ICommand>
  extends ObservableBus<CommandBase>
  implements ICommandBus<CommandBase>
{
  private readonly logger = new Logger(CommandBus.name);
  private handlers = new Map<
    string,
    (command: CommandBase, asyncContext?: AsyncContext) => any
  >();
  private _publisher: ICommandPublisher<CommandBase>;

  constructor(
    private readonly moduleRef: ModuleRef,
    @Optional()
    @Inject(CQRS_MODULE_OPTIONS)
    private readonly options?: CqrsModuleOptions,
  ) {
    super();

    if (this.options?.commandPublisher) {
      this._publisher = this.options.commandPublisher;
    } else {
      this.useDefaultPublisher();
    }
  }

  /**
   * Returns the publisher.
   * Default publisher is `DefaultCommandPubSub` (in memory).
   */
  get publisher(): ICommandPublisher<CommandBase> {
    return this._publisher;
  }

  /**
   * Sets the publisher.
   * Default publisher is `DefaultCommandPubSub` (in memory).
   * @param _publisher The publisher to set.
   */
  set publisher(_publisher: ICommandPublisher<CommandBase>) {
    this._publisher = _publisher;
  }

  /**
   * Executes a command.
   * @param command The command to execute.
   * @returns A promise that, when resolved, will contain the result returned by the command's handler.
   */
  execute<R = void>(command: Command<R>): Promise<R>;
  /**
   * Executes a command.
   * @param command The command to execute.
   * @param context The context to use. Optional.
   * @returns A promise that, when resolved, will contain the result returned by the command's handler.
   */
  execute<R = void>(command: Command<R>, context?: AsyncContext): Promise<R>;
  /**
   * Executes a command.
   * @param command The command to execute.
   * @param context The context to use. Optional.
   * @returns A promise that, when resolved, will contain the result returned by the command's handler.
   */
  execute<T extends CommandBase, R = any>(
    command: T,
    context?: AsyncContext,
  ): Promise<R>;
  /**
   * Executes a command.
   * @param command The command to execute.
   * @param context The context to use. Optional.
   * @returns A promise that, when resolved, will contain the result returned by the command's handler.
   */
  execute<T extends CommandBase, R = any>(
    command: T,
    context?: AsyncContext,
  ): Promise<R> {
    const commandId = this.getCommandId(command);
    const executeFn = this.handlers.get(commandId);
    if (!executeFn) {
      const commandName = this.getCommandName(command);
      throw new CommandHandlerNotFoundException(commandName);
    }
    this._publisher.publish(command);
    return executeFn(command, context);
  }

  bind<T extends CommandBase>(
    handler: InstanceWrapper<ICommandHandler<T>>,
    id: string,
  ) {
    if (handler.isDependencyTreeStatic()) {
      const instance = handler.instance;
      if (!instance.execute) {
        throw new InvalidCommandHandlerException();
      }
      this.handlers.set(id, (command) =>
        instance.execute(command as T & Command<unknown>),
      );
      return;
    }

    this.handlers.set(id, async (command: T, context?: AsyncContext) => {
      context ??= AsyncContext.of(command) ?? new AsyncContext();

      if (!AsyncContext.isAttached(context)) {
        // Commands returned by sagas may already have an async context set
        // and a corresponding request provider registered.
        this.moduleRef.registerRequestByContextId(context, context.id);

        context.attachTo(command);
      }

      const instance = await this.moduleRef.resolve(
        handler.metatype!,
        context.id,
        {
          strict: false,
        },
      );
      return instance.execute(command as T & Command<unknown>);
    });
  }

  register(handlers: InstanceWrapper<ICommandHandler<CommandBase>>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(
    handler: InstanceWrapper<ICommandHandler<CommandBase>>,
  ) {
    const typeRef = handler.metatype as Type<ICommandHandler<CommandBase>>;
    const target = this.reflectCommandId(typeRef);
    if (!target) {
      throw new InvalidCommandHandlerException();
    }

    if (this.handlers.has(target)) {
      this.logger.warn(
        `Command handler [${typeRef.name}] is already registered. Overriding previously registered handler.`,
      );
    }

    this.bind(handler, target);
  }

  private getCommandId(command: CommandBase): string {
    const { constructor: commandType } = Object.getPrototypeOf(command);
    const commandMetadata: CommandMetadata = Reflect.getMetadata(
      COMMAND_METADATA,
      commandType,
    );
    if (!commandMetadata) {
      throw new CommandHandlerNotFoundException(commandType.name);
    }

    return commandMetadata.id;
  }

  private getCommandName(command: CommandBase): string {
    const { constructor } = Object.getPrototypeOf(command);
    return constructor.name as string;
  }

  private reflectCommandId(handler: CommandHandlerType): string | undefined {
    const command: Type<ICommand> = Reflect.getMetadata(
      COMMAND_HANDLER_METADATA,
      handler,
    );
    const commandMetadata: CommandMetadata = Reflect.getMetadata(
      COMMAND_METADATA,
      command,
    );
    return commandMetadata.id;
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultCommandPubSub<CommandBase>(this.subject$);
  }
}
