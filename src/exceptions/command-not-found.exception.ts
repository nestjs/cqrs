/**
 * @publicApi
 */
export class CommandHandlerNotFoundException extends Error {
  constructor(commandName: string) {
    super(`No handler found for the command: "${commandName}".`);
  }
}
