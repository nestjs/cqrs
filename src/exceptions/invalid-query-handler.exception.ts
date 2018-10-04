export class InvalidQueryHandlerException extends Error {
  constructor() {
    super(
      `Invalid query handler exception. Define handled query using @QueryHandler() decorator`,
    );
  }
}
