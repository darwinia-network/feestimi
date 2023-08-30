export function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {}

  const error = new Error(
    `This value was thrown as is, not through an Error: ${stringified}`
  );
  return error;
}

type Jsonable =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly Jsonable[]
  | { readonly [key: string]: Jsonable }
  | { toJSON(): Jsonable };

export class FeestimiError extends Error {
  public readonly cause: Error | undefined;
  public readonly context: Jsonable;

  constructor(
    message: string,
    options: { cause?: Error; context?: Jsonable } = {}
  ) {
    const { cause, context } = options;
    super(message);
    this.name = this.constructor.name;

    this.context = context;
    this.cause = cause;
  }

  public toString = (): string => {
    const cause = this.cause ? `. Caused by: ${this.cause}` : "";
    const context = this.context
      ? `. Context: ${JSON.stringify(this.context)}`
      : "";

    return `${this.message}${context}${cause}`;
  };
}

// export type Result<E extends FeestimiError, T> =
//   | { success: true; result: T }
//   | { success: false; error: E };

// export function ok<T>(result: T): Result<never, T> {
//   return { success: true, result };
// }

// export function error<E extends FeestimiError>(error: E): Result<E, never> {
//   return { success: false, error };
// }
