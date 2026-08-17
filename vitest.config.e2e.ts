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
    // Type-checks the *.spec-d.ts files. Without an explicit tsconfig this
    // falls back to the root one, whose "node10" resolution cannot read the
    // ESM-only type exports of Vitest 4 / Vite 8.
    typecheck: { enabled: true, tsconfig: 'test/tsconfig.json' },
  },
});
