export const waitImmediate = () =>
  new Promise((resolve) => setImmediate(resolve));
