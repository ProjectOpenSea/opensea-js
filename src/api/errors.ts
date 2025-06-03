export class OpenSeaRatelimitError extends Error {
  public retryAfter?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public responseBody?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, retryAfter?: number, responseBody?: any) {
    super(message);
    this.name = "OpenSeaRatelimitError";
    this.retryAfter = retryAfter;
    this.responseBody = responseBody;
  }
}
