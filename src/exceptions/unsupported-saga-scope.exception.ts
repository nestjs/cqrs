/**
 * @publicApi
 */
export class UnsupportedSagaScopeException extends Error {
  constructor() {
    super(
      `Request-scoped saga hosts are not supported. Instead, you should retrieve async-context-specific instances within the saga itself, using the "ModuleRef" provider.`,
    );
  }
}
