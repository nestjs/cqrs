export class InvalidSagaException extends Error {
  constructor() {
    super(
      `Invalid saga exception. Each saga should return an Observable object`,
    );
  }
}
