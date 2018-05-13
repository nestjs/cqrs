"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidEventsHandlerException extends Error {
    constructor() {
        super(`Invalid event handler exception. Define handled events using @EventsHandler() decorator`);
    }
}
exports.InvalidEventsHandlerException = InvalidEventsHandlerException;
