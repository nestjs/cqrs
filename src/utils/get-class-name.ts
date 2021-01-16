export function getClassName<T>(cls: T): string {
  const { constructor } = Object.getPrototypeOf(cls);
  return constructor.name as string;
}
