
type AsyncFunction<Args extends unknown[], Result> =
  (...args: Args) => Promise<Result>;

export function withErrorHandling<Args extends unknown[], Result>(
  fn: AsyncFunction<Args, Result>,
  message: string
) {
  return async (...args: Args): Promise<Result> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(message, error);
      throw new Error(message);
    }
  };
}