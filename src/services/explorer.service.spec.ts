import { Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { EventsHandler } from '../decorators/events-handler.decorator.js';
import { IEventHandler } from '../interfaces/index.js';
import { ExplorerService } from './explorer.service.js';

class OrderPlacedEvent {}

@Injectable()
@EventsHandler(OrderPlacedEvent)
class OrderPlacedHandler implements IEventHandler<OrderPlacedEvent> {
  handle() {}
}

describe('ExplorerService', () => {
  describe('when a handler is also exposed through a "useExisting" alias', () => {
    it('should return the handler only once', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          OrderPlacedHandler,
          { provide: 'ORDER_PLACED_HANDLER', useExisting: OrderPlacedHandler },
        ],
      }).compile();

      const explorer = new ExplorerService(moduleRef.get(ModulesContainer));
      const { events } = explorer.explore();

      expect(events).toHaveLength(1);
    });
  });
});
