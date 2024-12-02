export class UnhandledExceptionEvent {
  constructor(public readonly failAt: 'command' | 'event' | 'saga') {}
}
