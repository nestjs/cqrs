export class UnhandledExceptionCommand {
  constructor(public readonly failAt: 'command' | 'event' | 'saga') {}
}
