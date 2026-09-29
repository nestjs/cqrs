import type { Mock } from 'vitest';
import { AggregateRoot } from './aggregate-root.js';
import { Publishable } from './decorators/publishable.decorator.js';
import { EventBus } from './event-bus.js';
import { EventPublisher } from './event-publisher.js';
import { IAggregateRoot, IEvent, IEventPublisher } from './interfaces/index.js';
import { WithAggregateRoot } from './mixins/index.js';
import { AsyncContext } from './scopes/index.js';
import { AggregateRootStorage } from './storages/aggregate-root.storage.js';

class OrderPlacedEvent implements IEvent {
  constructor(public readonly orderId: string) {}
}

class OrderShippedEvent implements IEvent {
  constructor(public readonly orderId: string) {}
}

class Order extends AggregateRoot {
  constructor(public readonly id = 'order-1') {
    super();
  }

  place() {
    this.apply(new OrderPlacedEvent(this.id));
  }

  ship() {
    this.apply(new OrderShippedEvent(this.id));
  }
}

interface TestPublisher extends IEventPublisher {
  publish: Mock<IEventPublisher['publish']>;
  publishAll: Mock<NonNullable<IEventPublisher['publishAll']>>;
}

function createEventBus(publisher: IEventPublisher) {
  const eventBus = new EventBus({} as any, {} as any, {} as any);
  eventBus.publisher = publisher;
  return eventBus;
}

function createPublisher(): TestPublisher {
  return { publish: vi.fn(), publishAll: vi.fn() };
}

const transactionContext = { transaction: { id: 'tx-1' } };

/**
 * The three ways an aggregate gets `publish()`/`publishAll()`, and the dispatcher context
 * each one passes by default.
 */
const paths: Array<{
  name: string;
  create: (eventBus: EventBus, asyncContext?: AsyncContext) => Order;
  defaultContext: (order: Order) => unknown;
  supportsAsyncContext: boolean;
}> = [
  {
    name: 'EventPublisher.mergeObjectContext()',
    create: (eventBus, asyncContext) =>
      new EventPublisher(eventBus).mergeObjectContext(
        new Order(),
        asyncContext,
      ),
    defaultContext: (order) => order,
    supportsAsyncContext: true,
  },
  {
    name: 'EventPublisher.mergeClassContext()',
    create: (eventBus, asyncContext) => {
      const MergedOrder = new EventPublisher(eventBus).mergeClassContext(
        Order,
        asyncContext,
      );
      return new MergedOrder();
    },
    defaultContext: (order) => order,
    supportsAsyncContext: true,
  },
  {
    name: '@Publishable()',
    create: (eventBus) => {
      @Publishable()
      class PublishableOrder extends Order {}

      AggregateRootStorage.mergeContext(eventBus);
      return new PublishableOrder();
    },
    defaultContext: () => undefined,
    supportsAsyncContext: false,
  },
];

describe('AggregateRoot', () => {
  describe.each(paths)('merged with $name', (path) => {
    let publisher: TestPublisher;
    let eventBus: EventBus;
    let order: Order;

    beforeEach(() => {
      publisher = createPublisher();
      eventBus = createEventBus(publisher);
      order = path.create(eventBus);
    });

    describe('commit()', () => {
      it('publishes the uncommitted events with the default dispatcher context, and clears them', () => {
        const eventBusPublishAll = vi.spyOn(eventBus, 'publishAll');
        order.place();
        order.ship();

        order.commit();

        expect(publisher.publishAll).toHaveBeenCalledTimes(1);
        expect(publisher.publishAll).toHaveBeenCalledWith(
          [],
          path.defaultContext(order),
          undefined,
        );
        // Exactly the arguments it passed before dispatcher contexts existed: the live
        // array of uncommitted events (hence empty now) and, for merged aggregates, the aggregate.
        const [events] = eventBusPublishAll.mock.calls[0];
        expect(events).toBe(order.getUncommittedEvents());
        expect(eventBusPublishAll.mock.calls[0]).toHaveLength(
          path.defaultContext(order) === undefined ? 1 : 3,
        );
        expect(order.getUncommittedEvents()).toEqual([]);
      });

      it("returns the publisher's result", async () => {
        publisher.publishAll.mockResolvedValue('published');
        order.place();

        await expect(order.commit()).resolves.toBe('published');
      });

      it("returns the publisher's rejected promise as is, so an ignored rejection surfaces as it did before", async () => {
        const error = new Error('broker down');
        const rejected = Promise.reject(error);
        const then = vi.spyOn(rejected, 'then');
        // A plain function: a vi.fn() attaches handlers to the promises it returns.
        const order = path.create(
          createEventBus({ publish() {}, publishAll: () => rejected }),
        );
        order.place();

        const result = order.commit();

        // Neither a handler nor a derived promise: whether the rejection is unhandled
        // depends on the caller (and the publisher) only, exactly as when commit() returned void.
        expect(result).toBe(rejected);
        expect(then).not.toHaveBeenCalled();
        expect(order.getUncommittedEvents()).toEqual([]);
        await expect(result).rejects.toBe(error);
      });

      it('keeps the events when the publisher throws synchronously', () => {
        publisher.publishAll.mockImplementation(() => {
          throw new Error('invalid event');
        });
        order.place();

        expect(() => order.commit()).toThrow('invalid event');
        expect(order.getUncommittedEvents()).toEqual([
          new OrderPlacedEvent('order-1'),
        ]);
      });
    });

    describe('commit(dispatcherContext)', () => {
      it('publishes the uncommitted events with the given dispatcher context, and clears them', async () => {
        publisher.publishAll.mockResolvedValue('committed');
        order.place();
        order.ship();

        const result = order.commit(transactionContext);

        expect(order.getUncommittedEvents()).toEqual([]);
        await expect(result).resolves.toBe('committed');
        expect(publisher.publishAll).toHaveBeenCalledWith(
          [new OrderPlacedEvent('order-1'), new OrderShippedEvent('order-1')],
          transactionContext,
          undefined,
        );
      });

      it('hands the publisher a copy of the events, which it can still read after the events are cleared', async () => {
        const seen: IEvent[][] = [];
        publisher.publishAll.mockImplementation(async (events) => {
          await Promise.resolve();
          seen.push([...events]);
        });
        order.place();

        await order.commit(transactionContext);

        expect(seen).toEqual([[new OrderPlacedEvent('order-1')]]);
      });

      it('rejects with the error the publisher rejects with, and leaves the events cleared', async () => {
        const error = new Error('transaction aborted');
        publisher.publishAll.mockRejectedValue(error);
        order.place();

        await expect(order.commit(transactionContext)).rejects.toBe(error);
        expect(order.getUncommittedEvents()).toEqual([]);
      });

      it('treats an undefined dispatcher context as none', () => {
        order.place();

        order.commit(undefined);

        expect(publisher.publishAll).toHaveBeenCalledWith(
          [],
          path.defaultContext(order),
          undefined,
        );
      });

      it('resolves with what the event bus returns when the publisher only implements publish()', async () => {
        const eventBus = createEventBus({
          publish: vi.fn().mockResolvedValue('published'),
        });
        const order = path.create(eventBus);
        order.place();

        const result = await order.commit(transactionContext);

        expect(eventBus.publisher.publish).toHaveBeenCalledWith(
          new OrderPlacedEvent('order-1'),
          transactionContext,
          undefined,
        );
        // EventBus.publishAll() returns one result per event in that case.
        expect(result).toHaveLength(1);
        await expect(result[0]).resolves.toBe('published');
      });
    });

    describe('publish() and publishAll()', () => {
      it('pass the default dispatcher context without one, and return the publisher result', () => {
        publisher.publish.mockReturnValue('one');
        publisher.publishAll.mockReturnValue('many');
        const event = new OrderPlacedEvent('order-1');

        expect(order.publish(event)).toBe('one');
        expect(order.publishAll([event])).toBe('many');

        const context = path.defaultContext(order);
        expect(publisher.publish).toHaveBeenCalledWith(
          event,
          context,
          undefined,
        );
        expect(publisher.publishAll).toHaveBeenCalledWith(
          [event],
          context,
          undefined,
        );
      });

      it('pass the given dispatcher context', () => {
        const event = new OrderPlacedEvent('order-1');

        order.publish(event, transactionContext);
        order.publishAll([event], transactionContext);

        expect(publisher.publish).toHaveBeenCalledWith(
          event,
          transactionContext,
          undefined,
        );
        expect(publisher.publishAll).toHaveBeenCalledWith(
          [event],
          transactionContext,
          undefined,
        );
      });
    });

    describe('with autoCommit', () => {
      it('publishes on apply() with the default dispatcher context, and commit() publishes nothing new', () => {
        order.autoCommit = true;

        order.place();

        expect(publisher.publish).toHaveBeenCalledWith(
          new OrderPlacedEvent('order-1'),
          path.defaultContext(order),
          undefined,
        );
        expect(order.getUncommittedEvents()).toEqual([]);

        order.commit(transactionContext);
        expect(publisher.publishAll).toHaveBeenCalledWith(
          [],
          transactionContext,
          undefined,
        );
      });
    });

    describe.runIf(path.supportsAsyncContext)('with an async context', () => {
      it('passes the async context along with the dispatcher context, and attaches it to the events', async () => {
        const asyncContext = new AsyncContext();
        const order = path.create(eventBus, asyncContext);
        order.place();

        await order.commit(transactionContext);

        const [[events, context, receivedAsyncContext]] =
          publisher.publishAll.mock.calls;
        expect(context).toBe(transactionContext);
        expect(receivedAsyncContext).toBe(asyncContext);
        expect(AsyncContext.of(events[0])).toBe(asyncContext);
      });

      it('keeps passing the aggregate and the async context without a dispatcher context', () => {
        const asyncContext = new AsyncContext();
        const order = path.create(eventBus, asyncContext);
        order.place();

        order.commit();

        expect(publisher.publishAll).toHaveBeenCalledWith(
          [],
          order,
          asyncContext,
        );
      });
    });
  });

  describe('typings', () => {
    it('accept subclasses and implementations whose publish methods and commit() return void', () => {
      class LegacyOrder extends Order {
        publish<T extends IEvent>(event: T): void {
          super.publish(event);
        }

        publishAll<T extends IEvent>(events: T[]): void {
          super.publishAll(events);
        }

        commit(): void {
          super.commit();
        }
      }

      class LegacyMixinOrder extends WithAggregateRoot(class {}) {
        commit(): void {
          super.commit();
        }
      }

      const legacy: IAggregateRoot = {
        autoCommit: false,
        publish() {},
        publishAll() {},
        commit() {},
        uncommit() {},
        getUncommittedEvents: () => [],
        loadFromHistory() {},
        apply() {},
      };

      const eventBus = createEventBus(createPublisher());
      const eventPublisher = new EventPublisher(eventBus);
      const merged: LegacyOrder = eventPublisher.mergeObjectContext(
        new LegacyOrder(),
      );
      const MergedClass = eventPublisher.mergeClassContext(LegacyMixinOrder);
      const aggregates: IAggregateRoot[] = [
        merged,
        new MergedClass(),
        eventPublisher.mergeObjectContext(legacy),
      ];

      expectTypeOf(new Order().commit).parameter(0).toEqualTypeOf<unknown>();
      expectTypeOf(new Order().commit).returns.toBeAny();
      expect(aggregates).toHaveLength(3);
    });
  });
});
