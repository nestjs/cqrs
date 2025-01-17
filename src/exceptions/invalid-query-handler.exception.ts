export class InvalidQueryHandlerException extends Error {
  constructor() {
    super(
      `An invalid query handler has been provided. Please ensure that the provided handler is a class annotated with @QueryHandler and contains an 'execute' method.`,
    );
  }
}
