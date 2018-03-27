import { ICommand } from './command.interface';
export interface ICommandBus {
    execute<T extends ICommand>(command: T): Promise<any>;
}
