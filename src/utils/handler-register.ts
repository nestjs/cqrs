import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { Type } from '@nestjs/common';
import { CommandHandlerNotFoundException } from '../exceptions';

export class HandlerRegister<T, TypeT extends Type<T> = Type<T>> {
  private handlers = new Map<string, T>();
  private scopedHandlers = new Map<string, TypeT>();

  constructor(private moduleRef: ModuleRef, private metadataKey: any) {}

  registerHandler(handler: TypeT): boolean {
    const target = this.reflectCommandName(handler);
    if (!target) {
      return false;
    }
    try {
      const instance = this.moduleRef.get(handler, { strict: false });
      if (instance) {
        if (Array.isArray(target)) {
          for (const singleTarget of target) {
            this.handlers.set(singleTarget.name, instance);
          }
        } else {
          this.handlers.set(target.name, instance);
        }
      }
    } catch {
      try {
        this.moduleRef.introspect(handler);
        if (Array.isArray(target)) {
          for (const singleTarget of target) {
            this.scopedHandlers.set(singleTarget.name, handler);
          }
        } else {
          this.scopedHandlers.set(target.name, handler);
        }
      } catch {
        return false;
      }
    }

    return true;
  }

  private reflectCommandName(
    handler: TypeT,
  ): FunctionConstructor | FunctionConstructor[] {
    return Reflect.getMetadata(this.metadataKey, handler);
  }

  async get<C>(command: C): Promise<T | undefined> {
    const commandName = this.getName(command);
    let handler = this.handlers.get(commandName);

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

  getName<T>(command: T): string {
    const { constructor } = Object.getPrototypeOf(command);
    return constructor.name as string;
  }
}
