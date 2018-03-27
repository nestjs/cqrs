export class CommandHandlerNotFoundException {
  constructor(
    public readonly message = 'CommandHandler not found exception!',
  ) {}
}
