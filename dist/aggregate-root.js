"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AggregateRoot {
  constructor() {
    this.events = [];
    this.autoCommit = false;
  }
  publish(event) {}
  commit() {
    this.events.forEach(event => this.publish(event));
    this.events.length = 0;
  }
  uncommit() {
    this.events.length = 0;
  }
  getUncommittedEvents() {
    return this.events;
  }
  loadFromHistory(history) {
    history.forEach(event => this.apply(event, true));
  }
  apply(event, isFromHistory = false) {
    if (!isFromHistory && !this.autoCommit) {
      this.events.push(event);
    }
    this.autoCommit && this.publish(event);
    const handler = this.getEventHandler(event);
    handler && handler(event);
  }
  getEventHandler(event) {
    const handler = `on${this.getEventName(event)}`;
    return this[handler];
  }
  getEventName(event) {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name;
  }
}
exports.AggregateRoot = AggregateRoot;
