export class QueryHandlerAlreadyDefined extends Error {
  constructor(
    queryName: string,
    newQueryHandlerName: string,
    existingQueryHandlerName: string,
  ) {
    super(
      `Query handler for ${queryName} is already defined! Existing query handler - ${existingQueryHandlerName}, new query handler - ${newQueryHandlerName}`,
    );
  }
}
