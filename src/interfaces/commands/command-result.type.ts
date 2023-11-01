import { Command } from './command';

export type CommandResult<CommandT extends Command<unknown>> =
  CommandT extends Command<infer ResultT> ? ResultT : never;
