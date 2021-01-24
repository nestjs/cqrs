import { CommandBus } from './command-bus';
import { ModuleRef } from '@nestjs/core';
import { EventBus } from './event-bus';

describe('EventBus', () => {
  let target: EventBus;
  let moduleRef: ModuleRef;
  let commandBus: CommandBus;

  beforeEach(() => {
    moduleRef = {} as any;
    commandBus = {} as any;
    target = new EventBus(commandBus, moduleRef);
  });

  describe('.bind()', () => {
    let subscribe: jest.SpyInstance;

    beforeEach(() => {
      subscribe = jest.fn().mockReturnValue('resulted subscription');
      jest.spyOn(target, 'ofEventName' as any).mockReturnValue({ subscribe });
      jest
        .spyOn(target, 'subscribeCallbackFactory' as any)
        .mockReturnValue('subscribe callback');
    });

    it('should subscribe using subscribeCallbackFactory result', () => {
      const result = target.bind('some handler type' as any, 'event name');

      expect(target['ofEventName']).toHaveBeenCalledTimes(1);
      expect(target['ofEventName']).toHaveBeenCalledWith('event name');
      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(subscribe).toHaveBeenCalledWith('subscribe callback');
      expect(target['subscriptions']).toEqual(['resulted subscription']);
      expect(result).toBeUndefined();
    });
  });

  describe('.subscribeCallbackFactory()', () => {
    let get: jest.SpyInstance;
    let handle: jest.SpyInstance;

    beforeEach(() => {
      handle = jest.fn().mockResolvedValue('expected result');
      get = jest
        .spyOn(target['handlers'], 'get')
        .mockResolvedValue({ handle } as any);
    });

    it('should return a function that calls handle method of the obtained handler and return the result', async () => {
      const callback = target['subscribeCallbackFactory']();
      const result = await callback('my command');

      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('my command');
      expect(handle).toHaveBeenCalledTimes(1);
      expect(handle).toHaveBeenCalledWith('my command');
      expect(result).toBeUndefined();
    });
  });
});
