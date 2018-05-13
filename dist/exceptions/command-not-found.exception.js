"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommandHandlerNotFoundException {
    constructor(message = 'CommandHandler not found exception!') {
        this.message = message;
    }
}
exports.CommandHandlerNotFoundException = CommandHandlerNotFoundException;
