"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidModuleRefException extends Error {
    constructor() {
        super(`Invalid ModuleRef exception. Remember to set module reference "setModuleRef()".`);
    }
}
exports.InvalidModuleRefException = InvalidModuleRefException;
