export class InvalidEventsHandlerException extends Error {
  constructor() {
    super(
      `Invalid event handler exception. Define handled events using @EventsHandler() decorator`,
    );
  }
}
