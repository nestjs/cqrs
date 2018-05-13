"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidSagaException extends Error {
    constructor() {
        super(`Invalid saga exception. Each saga should retuns an Observable object.`);
    }
}
exports.InvalidSagaException = InvalidSagaException;
