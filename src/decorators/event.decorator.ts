import { EVENT_METADATA } from './constants';

export const Event = (name?: string): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(EVENT_METADATA, name, target);
  };
};
