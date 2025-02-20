import { Injectable, InjectableOptions } from '@nestjs/common';
import { randomUUID } from 'crypto';
import 'reflect-metadata';
import { ICommand } from '../index';
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from './constants';

/**
 * Decorator that marks a class as a Nest command handler. A command handler
 * handles commands (actions) executed by your application code.
 *
 * The decorated class must implement the `ICommandHandler` interface.
 *
 * @param command command *type* to be handled by this handler.
 * @param options injectable options passed on to the "@Injectable" decorator.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#commands
 *
 * @publicApi
 */
export const CommandHandler = (
  command: ICommand | (new (...args: any[]) => ICommand),
  options?: InjectableOptions,
): ClassDecorator => {
  return (target: Function) => {
    if (!Reflect.hasOwnMetadata(COMMAND_METADATA, command)) {
      Reflect.defineMetadata(COMMAND_METADATA, { id: randomUUID() }, command);
    }
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);

    if (options) {
      Injectable(options)(target);
    }
  };
};
