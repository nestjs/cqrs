import { Injectable } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import {
  COMMAND_HANDLER_METADATA,
  EVENTS_HANDLER_METADATA,
  QUERY_HANDLER_METADATA,
  SAGA_METADATA,
} from '../decorators/constants';
import {
  ICommandHandler,
  IEvent,
  IEventHandler,
  IQueryHandler,
} from '../interfaces';
import { ProvidersIntrospectionResult } from '../interfaces/providers-introspection-result.interface';

@Injectable()
export class ExplorerService<EventBase extends IEvent = IEvent> {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  explore(): ProvidersIntrospectionResult {
    const modules = [...this.modulesContainer.values()];
    const commands = this.flatMap<ICommandHandler>(modules, (instance) =>
      this.filterByMetadataKey(instance, COMMAND_HANDLER_METADATA),
    );
    const queries = this.flatMap<IQueryHandler>(modules, (instance) =>
      this.filterByMetadataKey(instance, QUERY_HANDLER_METADATA),
    );
    const events = this.flatMap<IEventHandler<EventBase>>(modules, (instance) =>
      this.filterByMetadataKey(instance, EVENTS_HANDLER_METADATA),
    );
    const sagas = this.flatMap(modules, (instance) =>
      this.filterByMetadataKey(instance, SAGA_METADATA),
    );
    return { commands, queries, events, sagas };
  }

  flatMap<T extends object>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => InstanceWrapper<any> | undefined,
  ): InstanceWrapper<T>[] {
    const items = modules
      .map((moduleRef) => [...moduleRef.providers.values()].map(callback))
      .reduce((a, b) => a.concat(b), []);
    return items.filter((item) => !!item) as InstanceWrapper<T>[];
  }

  filterByMetadataKey(wrapper: InstanceWrapper, metadataKey: string) {
    const { instance } = wrapper;
    if (!instance) {
      return;
    }
    if (!instance.constructor) {
      return;
    }
    const metadata = Reflect.getMetadata(metadataKey, instance.constructor);
    if (!metadata) {
      return;
    }
    return wrapper;
  }
}
