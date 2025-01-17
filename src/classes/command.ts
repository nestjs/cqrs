import { ICommand } from '../interfaces';
import { RESULT_TYPE_SYMBOL } from './constants';

/**
 * Utility type to extract the result type of a command.
 */
export type CommandResult<C extends Command<unknown>> =
  C extends Command<infer R> ? R : never;

export class Command<T> implements ICommand {
  readonly [RESULT_TYPE_SYMBOL]: T;
}
