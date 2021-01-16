import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { Type } from '@nestjs/common';
import { getClassName } from './get-class-name';

export class HandlerRegister<T, TypeT extends Type<T> = Type<T>> {
  private singletonHandlers = new Map<string, T>();
  private scopedHandlers = new Map<string, TypeT>();

  constructor(private moduleRef: ModuleRef, private metadataKey: unknown) {}

  registerHandler(handler: TypeT): boolean {
    const target = Reflect.getMetadata(this.metadataKey, handler);
    if (!target) {
      return false;
    }
    const targetArray = Array.isArray(target) ? target : [target];
    try {
      const instance = this.moduleRef.get(handler, { strict: false });
      targetArray.forEach(({ name }) =>
        this.singletonHandlers.set(name, instance),
      );
    } catch {
      this.moduleRef.introspect(handler);
      targetArray.forEach(({ name }) => this.scopedHandlers.set(name, handler));
    }

    return true;
  }

  async get<C>(command: C): Promise<T | undefined> {
    const commandName = getClassName(command);
    let handler = this.singletonHandlers.get(commandName);

    if (!handler) {
      const contextId = ContextIdFactory.create();
      const handlerType = this.scopedHandlers.get(commandName);
      if (handlerType) {
        handler = await this.moduleRef.resolve(handlerType, contextId, {
          strict: false,
        });
      }
    }

    return handler;
  }
}
