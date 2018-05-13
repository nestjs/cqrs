"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const constants_1 = require("./constants");
exports.EventsHandler = (...events) => {
    return (target) => {
        Reflect.defineMetadata(constants_1.EVENTS_HANDLER_METADATA, events, target);
    };
};
