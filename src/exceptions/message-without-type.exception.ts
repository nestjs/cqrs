export class MessageWithoutTypeException extends Error {
  private readonly _incomingMessage: any;

  get incomingMessage() {
    return this._incomingMessage;
  }

  constructor(incomingMessage: any) {
    super('Incoming message has no defined type.');
    this._incomingMessage = incomingMessage;
  }
}
