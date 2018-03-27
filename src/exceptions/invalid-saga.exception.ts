export class InvalidSagaException extends Error {
  constructor() {
    super(
      `Invalid saga exception. Each saga should retuns an Observable object.`,
    );
  }
}
