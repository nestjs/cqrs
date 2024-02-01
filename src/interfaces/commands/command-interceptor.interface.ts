import { ICommand } from './command.interface';

/**
 * Interface describing implementation of a command interceptor
 *
 * @publicApi
 */
export interface ICommandInterceptor<T extends ICommand = any, R = any> {
  /**
   * Method to implement a custom command interceptor.
   * @param command the command to execute.
   * @param next a reference to the function, which provides access to the command handler
   */
  intercept(command: T, next: () => Promise<R>): Promise<R>;
}
