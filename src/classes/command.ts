import { ICommand } from '../interfaces/index.js';
import { RESULT_TYPE_SYMBOL } from './constants.js';

/**
 * Utility type to extract the result type of a command.
 */
export type CommandResult<C extends Command<unknown>> =
  C extends Command<infer R> ? R : never;

export class Command<T> implements ICommand {
  readonly [RESULT_TYPE_SYMBOL]: T;
}
