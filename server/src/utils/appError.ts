/**
 * Operational error with an HTTP status. `extra` fields are merged into the
 * JSON error body — used to preserve the original responses that returned
 * additional flags alongside `error` (e.g. { error, recoverable: true }).
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly extra?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
