import { Injectable, Type } from '@nestjs/common';
import { ICommand, ICommandInterceptor } from './interfaces';
import { ModuleRef } from '@nestjs/core';

export type CommandInterceptorType = Type<ICommandInterceptor>;

@Injectable()
export class CommandInterceptionExecutor {
  private interceptors: ICommandInterceptor[] = [];

  constructor(private readonly moduleRef: ModuleRef) {}

  intercept<T extends ICommand, R>(
    command: T,
    next: () => Promise<R>,
  ): Promise<R> {
    if (this.interceptors.length === 0) {
      return next();
    }

    const nextFn = async (i = 0): Promise<R> => {
      if (i >= this.interceptors.length) {
        return next();
      }

      const handler = () => nextFn(i + 1);
      return this.interceptors[i].intercept(command, handler);
    };

    return nextFn();
  }

  register(interceptors: CommandInterceptorType[] = []) {
    interceptors.forEach((interceptor) =>
      this.registerInterceptor(interceptor),
    );
  }

  private registerInterceptor(interceptor: CommandInterceptorType) {
    const instance = this.moduleRef.get(interceptor, { strict: false });

    if (!instance) {
      return;
    }

    this.interceptors.push(instance);
  }
}
