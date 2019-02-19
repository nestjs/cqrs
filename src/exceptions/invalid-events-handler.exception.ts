export class InvalidEventsHandlerException extends Error {
  constructor() {
    super(
      `Invalid event handler exception (missing @EventsHandler() decorator?)`,
    );
  }
}
