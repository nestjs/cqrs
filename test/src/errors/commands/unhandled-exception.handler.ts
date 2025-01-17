import { CommandHandler, EventBus, ICommandHandler } from '../../../../src';
import { UnhandledExceptionEvent } from '../events/unhandled-exception.event';
import { UnhandledExceptionCommand } from './unhandled-exception.command';

@CommandHandler(UnhandledExceptionCommand)
export class UnhandledExceptionCommandHandler
  implements ICommandHandler<UnhandledExceptionCommand>
{
  constructor(private readonly eventBus: EventBus) {}

  async execute(command: UnhandledExceptionCommand) {
    if (command.failAt === 'command') {
      throw new Error(`Unhandled exception in ${command.failAt}`);
    } else {
      this.eventBus.publish(new UnhandledExceptionEvent(command.failAt));
    }
  }
}
