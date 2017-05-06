import { Component, ModuleRef } from 'nest.js';
import { Subject } from 'rxjs/Subject';
import { ICommandBus, ICommand, ICommandHandler } from './interfaces/index';
import { CommandHandlerNotFoundException } from './exceptions/command-not-found.exception';
import { ObservableBus } from './utils/observable-bus';
import { Metatype } from 'nest.js/common/interfaces';

@Component()
export class CommandBus extends ObservableBus<ICommand> implements ICommandBus {
    private handlers = new Map<string, ICommandHandler<ICommand>>();

    constructor(private readonly moduleRef: ModuleRef) {
        super();
    }

    execute<T extends ICommand>(command: T): Promise<any> {
        const handler = this.handlers.get(this.getCommandName(command));
        if (!handler) {
            throw new CommandHandlerNotFoundException();
        }
        this.subject$.next(command);
        return new Promise((resolve) => {
            handler.execute(command, resolve);
        });
    }

    bind<T extends ICommand>(handler: ICommandHandler<T>, name: string) {
        this.handlers.set(name, handler);
    }

    register(handlers: Metatype<ICommandHandler<ICommand>>[]) {
        handlers.forEach((handler) => this.registerHandler(handler));
    }

    protected registerHandler(handler: Metatype<ICommandHandler<ICommand>>) {
        const { name } = handler;
        const instance = this.moduleRef.get(handler);
        if (!instance) return;

        const target = name.replace('Handler', 'Command');
        this.bind(instance as ICommandHandler<ICommand>, target);
    }

    private getCommandName(command): string {
        const { constructor } = Object.getPrototypeOf(command);
        return constructor.name as string;
    }
}