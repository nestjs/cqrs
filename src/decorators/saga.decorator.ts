import 'reflect-metadata';
import { SAGA_METADATA } from './constants';

/**
 * Decorator that marks a class as a Nest saga. Sagas may listen and react to 1..N events.
 *
 * @see https://docs.nestjs.com/recipes/cqrs#sagas
 */
export const Saga = (): PropertyDecorator => {
  return (target: object, propertyKey: string | symbol) => {
    const properties =
      Reflect.getMetadata(SAGA_METADATA, target.constructor) || [];
    Reflect.defineMetadata(
      SAGA_METADATA,
      [...properties, propertyKey],
      target.constructor,
    );
  };
};
