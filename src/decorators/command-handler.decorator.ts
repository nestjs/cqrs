import 'reflect-metadata';
import { ICommand } from '../index';
import { COMMAND_HANDLER_METADATA } from './constants';

/**
 * CommandHandler handles actions dispatched on `CommandBus`
 * @param command `ICommand`
 * @see https://docs.nestjs.com/recipes/cqrs#commands
 */
export const CommandHandler = (command: ICommand): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
  };
};
