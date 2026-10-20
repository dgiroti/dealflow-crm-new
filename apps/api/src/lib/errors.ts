// An error we throw on purpose, with the HTTP status and a message that's safe to show users.
// Anything that is NOT an AppError is treated as unexpected (500, and logged).
export class AppError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}
