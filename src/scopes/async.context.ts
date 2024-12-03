import { ContextIdFactory } from '@nestjs/core';

export const ASYNC_CONTEXT_ATTRIBUTE = Symbol('ASYNC_CONTEXT_ATTRIBUTE');

/**
 * Represents the context of an asynchronous operation.
 */
export class AsyncContext {
  public readonly id = ContextIdFactory.create();

  /**
   * Attaches the context to an object.
   * @param target The object to attach the context to.
   */
  public attachTo(target: object) {
    Object.defineProperty(target, ASYNC_CONTEXT_ATTRIBUTE, {
      value: this,
      enumerable: false,
    });
  }

  /**
   * Checks if target is already attached to any async context.
   * @param target The object to check.
   * @returns "true" if the target is attached to an async context, "false" otherwise.
   */
  static isAttached(target: object): boolean {
    return !!target[ASYNC_CONTEXT_ATTRIBUTE];
  }

  /**
   * Merges the context of an asynchronous operation from a given command, query, or event to another object.
   * @param from A command, query, or event.
   * @param to A command, query, or event to merge the context to.
   */
  static merge(from: object, to: object) {
    if (!from || !to) {
      return;
    }
    const fromContext = from[ASYNC_CONTEXT_ATTRIBUTE];
    if (!fromContext) {
      return;
    }
    Object.defineProperty(to, ASYNC_CONTEXT_ATTRIBUTE, {
      value: fromContext,
      enumerable: false,
    });
  }

  /**
   * Gets the context of an asynchronous operation from a given object.
   * @param target A command, query, or event.
   * @returns An "AsyncContext" instance or "undefined" if the context is not found.
   */
  static of(target: object): AsyncContext | undefined {
    return target[ASYNC_CONTEXT_ATTRIBUTE];
  }
}
