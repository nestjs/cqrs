"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidCommandHandlerException extends Error {
    constructor() {
        super(`Invalid command handler exception. Define handled command using @CommandHandler() decorator`);
    }
}
exports.InvalidCommandHandlerException = InvalidCommandHandlerException;
