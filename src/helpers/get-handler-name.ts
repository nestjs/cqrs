export const getHandlerName = <T>(instance: T): string =>
  (instance as Object).constructor.name;
