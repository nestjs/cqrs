import { InvalidQueryHandlerException } from './exceptions/invalid-query-handler.exception';
import { ModuleRef } from '@nestjs/core';
import { QueryBus } from './query-bus';
import { QueryHandlerNotFoundException } from './exceptions';

describe('QueryBus', () => {
  let target: QueryBus;
  let moduleRef: ModuleRef;

  beforeEach(() => {
    moduleRef = {} as any;
    target = new QueryBus(moduleRef);
  });

  describe('.execute()', () => {
    let get: jest.SpyInstance;

    beforeEach(() => {
      get = jest.spyOn(target['handlers'], 'get');
    });

    it('should call execute of the obtained handler and return the result', async () => {
      const execute = jest.fn().mockResolvedValue('expected result');
      get.mockResolvedValue({ execute } as any);

      const result = await target.execute('my command');

      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('my command');
      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith('my command');
      expect(result).toBe('expected result');
    });

    it('should throw a QueryHandlerNotFoundException when no handler is found for the informed command', async () => {
      get.mockResolvedValue(undefined);
      let thrownError: any;

      try {
        await target.execute('my command');
      } catch (error) {
        thrownError = error;
      }

      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('my command');
      expect(thrownError).toBeInstanceOf(QueryHandlerNotFoundException);
    });
  });

  describe('.registerHandler()', () => {
    let registerHandler: jest.SpyInstance;

    beforeEach(() => {
      registerHandler = jest
        .spyOn(target['handlers'], 'registerHandler')
        .mockReturnValue(true);
    });

    it('should return with no errors when registerHandler returns true', () => {
      const result = target['registerHandler']('handler type' as any);

      expect(registerHandler).toHaveBeenCalledTimes(1);
      expect(registerHandler).toHaveBeenCalledWith('handler type');
      expect(result).toBeUndefined();
    });

    it('should thrown an InvalidQueryHandlerException when registerHandler returns false', () => {
      registerHandler.mockReturnValue(false);
      let thrownError: any;

      try {
        target['registerHandler']('handler type' as any);
      } catch (error) {
        thrownError = error;
      }

      expect(registerHandler).toHaveBeenCalledTimes(1);
      expect(registerHandler).toHaveBeenCalledWith('handler type');
      expect(thrownError).toBeInstanceOf(InvalidQueryHandlerException);
    });
  });
});
