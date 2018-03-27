export class InvalidCommandHandlerException extends Error {
  constructor() {
    super(
      `Invalid command handler exception. Define handled command using @CommandHandler() decorator`,
    );
  }
}
