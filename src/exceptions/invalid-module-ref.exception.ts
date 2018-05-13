export class InvalidModuleRefException extends Error {
  constructor() {
    super(
      `Invalid ModuleRef exception. Remember to set module reference "setModuleRef()".`,
    );
  }
}
