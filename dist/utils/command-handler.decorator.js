"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const constants_1 = require("./constants");
exports.CommandHandler = (command) => {
    return (target) => {
        Reflect.defineMetadata(constants_1.COMMAND_HANDLER_METADATA, command, target);
    };
};
