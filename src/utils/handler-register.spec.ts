import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { HandlerRegister } from './handler-register';
import * as getClassNameLib from './get-class-name';
import 'reflect-metadata';

describe('utils/HandlerRegister', () => {
  let target: HandlerRegister<any>;
  let moduleRef: ModuleRef;

  beforeEach(() => {
    moduleRef = {} as any;
    target = new HandlerRegister(moduleRef, 'some injection key');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('.registerHandler()', () => {
    let getMetadata: jest.SpyInstance;
    let get: jest.SpyInstance;
    let introspect: jest.SpyInstance;

    beforeEach(() => {
      getMetadata = jest.spyOn(Reflect, 'getMetadata').mockImplementation();
      get = moduleRef.get = jest.fn();
      introspect = moduleRef.introspect = jest.fn();
    });

    it('should return false when no metadata is found', () => {
      const result = target.registerHandler('my handler type' as any);

      expect(getMetadata).toBeCalledTimes(1);
      expect(getMetadata).toHaveBeenCalledWith(
        'some injection key',
        'my handler type',
      );
      expect(moduleRef.get).toBeCalledTimes(0);
      expect(moduleRef.introspect).toBeCalledTimes(0);
      expect(result).toBe(false);
    });

    it('should return true and associate a command with a singleton handler when the singleton instance is obtainable', () => {
      getMetadata.mockReturnValue({ name: 'commandName' });
      get.mockReturnValue('singleton handler instance');

      const result = target.registerHandler('my handler type' as any);

      expect(getMetadata).toBeCalledTimes(1);
      expect(getMetadata).toHaveBeenCalledWith(
        'some injection key',
        'my handler type',
      );
      expect(moduleRef.get).toBeCalledTimes(1);
      expect(moduleRef.get).toBeCalledWith('my handler type', {
        strict: false,
      });
      expect(moduleRef.introspect).toBeCalledTimes(0);
      expect(Array.from(target['singletonHandlers'].entries())).toEqual([
        ['commandName', 'singleton handler instance'],
      ]);
      expect(result).toBe(true);
    });

    it('should return true and associate multiples commands with a singleton handler when the singleton instance is obtainable and the metadata returns multiple targets', () => {
      getMetadata.mockReturnValue([
        { name: 'commandName1' },
        { name: 'commandName2' },
        { name: 'commandName3' },
      ]);
      get.mockReturnValue('singleton handler instance');

      const result = target.registerHandler('my handler type' as any);

      expect(getMetadata).toBeCalledTimes(1);
      expect(getMetadata).toHaveBeenCalledWith(
        'some injection key',
        'my handler type',
      );
      expect(moduleRef.get).toBeCalledTimes(1);
      expect(moduleRef.get).toBeCalledWith('my handler type', {
        strict: false,
      });
      expect(moduleRef.introspect).toBeCalledTimes(0);
      expect(Array.from(target['singletonHandlers'].entries())).toEqual([
        ['commandName1', 'singleton handler instance'],
        ['commandName2', 'singleton handler instance'],
        ['commandName3', 'singleton handler instance'],
      ]);
      expect(result).toBe(true);
    });

    it('should return true and associate a command with a handler types when the singleton instance is not obtainable', () => {
      getMetadata.mockReturnValue({ name: 'commandName' });
      get.mockImplementation(() => {
        throw new Error('any error');
      });

      const result = target.registerHandler('my handler type' as any);

      expect(getMetadata).toBeCalledTimes(1);
      expect(getMetadata).toHaveBeenCalledWith(
        'some injection key',
        'my handler type',
      );
      expect(moduleRef.get).toBeCalledTimes(1);
      expect(moduleRef.get).toBeCalledWith('my handler type', {
        strict: false,
      });
      expect(moduleRef.introspect).toBeCalledTimes(1);
      expect(moduleRef.introspect).toBeCalledWith('my handler type');
      expect(Array.from(target['scopedHandlers'].entries())).toEqual([
        ['commandName', 'my handler type'],
      ]);
      expect(result).toBe(true);
    });

    it('should return true and associate multiples commands with a singleton handler when the singleton instance is obtainable and the metadata returns multiple targets', () => {
      getMetadata.mockReturnValue([
        { name: 'commandName1' },
        { name: 'commandName2' },
        { name: 'commandName3' },
      ]);
      get.mockImplementation(() => {
        throw new Error('any error');
      });

      const result = target.registerHandler('my handler type' as any);

      expect(getMetadata).toBeCalledTimes(1);
      expect(getMetadata).toHaveBeenCalledWith(
        'some injection key',
        'my handler type',
      );
      expect(moduleRef.get).toBeCalledTimes(1);
      expect(moduleRef.get).toBeCalledWith('my handler type', {
        strict: false,
      });
      expect(moduleRef.introspect).toBeCalledTimes(1);
      expect(moduleRef.introspect).toBeCalledWith('my handler type');
      expect(Array.from(target['scopedHandlers'].entries())).toEqual([
        ['commandName1', 'my handler type'],
        ['commandName2', 'my handler type'],
        ['commandName3', 'my handler type'],
      ]);
      expect(result).toBe(true);
    });

    it('should throws n erro when no singleton instance is obtainable and the handler type is not introspectable', () => {
      getMetadata.mockReturnValue({ name: 'commandName' });
      get.mockImplementation(() => {
        throw new Error('any error');
      });
      const expectedError = new Error('any error');
      introspect.mockImplementation(() => {
        throw expectedError;
      });
      let thrownError: any;

      try {
        target.registerHandler('my handler type' as any);
      } catch (error) {
        thrownError = expectedError;
      }

      expect(getMetadata).toBeCalledTimes(1);
      expect(getMetadata).toHaveBeenCalledWith(
        'some injection key',
        'my handler type',
      );
      expect(moduleRef.get).toBeCalledTimes(1);
      expect(moduleRef.get).toBeCalledWith('my handler type', {
        strict: false,
      });
      expect(moduleRef.introspect).toBeCalledTimes(1);
      expect(moduleRef.introspect).toBeCalledWith('my handler type');
      expect(thrownError).toBe(expectedError);
    });
  });

  describe('.get()', () => {
    let resolve: jest.SpyInstance;

    beforeEach(() => {
      moduleRef.resolve = jest.fn().mockResolvedValue('scoped handler');
      jest
        .spyOn(getClassNameLib, 'getClassName')
        .mockReturnValue('commandName');
      jest
        .spyOn(ContextIdFactory, 'create')
        .mockReturnValue('contextId' as any);
    });

    it('should return a singleton handler when a singleton instance is available', async () => {
      target['singletonHandlers'].set('commandName', 'singleton handler');

      const result = await target.get('command');

      expect(getClassNameLib.getClassName).toHaveBeenCalledTimes(1);
      expect(getClassNameLib.getClassName).toHaveBeenCalledWith('command');
      expect(ContextIdFactory.create).toHaveBeenCalledTimes(0);
      expect(moduleRef.resolve).toHaveBeenCalledTimes(0);
      expect(result).toBe('singleton handler');
    });

    it('should return a scoped handler when a singleton instance is available', async () => {
      target['scopedHandlers'].set('commandName', 'scoped handler type' as any);

      const result = await target.get('command');

      expect(getClassNameLib.getClassName).toHaveBeenCalledTimes(1);
      expect(getClassNameLib.getClassName).toHaveBeenCalledWith('command');
      expect(ContextIdFactory.create).toHaveBeenCalledTimes(1);
      expect(ContextIdFactory.create).toHaveBeenCalledWith();
      expect(moduleRef.resolve).toHaveBeenCalledTimes(1);
      expect(moduleRef.resolve).toHaveBeenCalledWith(
        'scoped handler type',
        'contextId',
        { strict: false },
      );
      expect(result).toBe('scoped handler');
    });
  });
});
