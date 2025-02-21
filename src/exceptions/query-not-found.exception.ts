/**
 * @publicApi
 */
export class QueryHandlerNotFoundException extends Error {
  constructor(queryName: string) {
    super(`No handler found for the query: "${queryName}"`);
  }
}
