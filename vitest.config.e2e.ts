import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: {
    transform: { decorators: { legacy: true, emitDecoratorMetadata: true } },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/e2e/**/*.spec.ts'],
    fileParallelism: false,
  },
});
