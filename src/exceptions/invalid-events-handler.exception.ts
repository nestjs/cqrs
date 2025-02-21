/**
 * @publicApi
 */
export class InvalidEventsHandlerException extends Error {
  constructor() {
    super(
      `An invalid events handler has been provided. Please ensure that the provided handler is a class annotated with @EventsHandler and contains a 'handle' method.`,
    );
  }
}
