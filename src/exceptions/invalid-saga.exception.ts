/**
 * @publicApi
 */
export class InvalidSagaException extends Error {
  constructor() {
    super(`Invalid saga. Each saga should return Observable stream.`);
  }
}
