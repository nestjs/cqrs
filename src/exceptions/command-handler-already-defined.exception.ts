export class CommandHandlerAlreadyDefinedException extends Error {
  constructor(
    commandName: string,
    newHandlerName: string,
    existingHandlerName: string,
  ) {
    super(
      `Command handler for ${commandName} is already defined! Existing handler name - ${existingHandlerName}, new handler name - ${newHandlerName}`,
    );
  }
}
