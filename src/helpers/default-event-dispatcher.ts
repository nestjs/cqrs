import { Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  ICommand,
  ICommandBus,
  IEvent,
  IEventDispatcher,
  IEventHandler,
} from '../interfaces';

export class DefaultEventDispatcher<EventBase extends IEvent = IEvent>
  implements IEventDispatcher<EventBase> {
  processSaga(
    materializedSaga: Observable<ICommand>,
  ): Observable<ICommand> | Promise<Observable<ICommand>> {
    return materializedSaga.pipe(filter(e => !!e));
  }

  fireEventHandler(
    event: EventBase,
    handler: IEventHandler<EventBase>,
  ): void | Promise<void> {
    handler.handle(event);
  }

  fireSagaCommand(
    command: ICommand,
    commandBus: ICommandBus,
  ): void | Promise<void> {
    commandBus.execute(command);
  }

  processEventBinding(
    eventType: Type<EventBase>,
    handler: IEventHandler<EventBase>,
    stream: Observable<EventBase>,
  ): Observable<EventBase> | Promise<Observable<EventBase>> {
    return stream;
  }
}
