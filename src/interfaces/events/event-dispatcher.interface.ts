import { Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ICommandBus, ICommand } from '..';
import { IEventHandler } from './event-handler.interface';
import { IEvent } from './event.interface';

export interface IEventDispatcher<EventBase extends IEvent = IEvent> {
  fireEventHandler(
    event: EventBase,
    handler: IEventHandler<EventBase>,
  ): void | Promise<void>;
  processSaga(
    materializedSaga: Observable<ICommand>,
  ): Observable<ICommand> | Promise<Observable<ICommand>>;
  fireSagaCommand(
    command: ICommand,
    commandBus: ICommandBus,
  ): void | Promise<void>;
  processEventBinding(
    event: Type<EventBase>,
    handler: IEventHandler<EventBase>,
    stream: Observable<EventBase>,
  ): Observable<EventBase> | Promise<Observable<EventBase>>;
}
