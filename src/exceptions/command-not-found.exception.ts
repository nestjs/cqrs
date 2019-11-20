export class CommandHandlerNotFoundException {
  public readonly message: string;
  constructor(commandName: string) {
    this.message = `CommandHandler of Command "${commandName}" not found exception!`;
  }
}
