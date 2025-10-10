import type { Context } from "hono";
import { makeError } from "utils/error";

export async function errorHandlerMiddleware(err: Error, c: Context) {
  const { error, statusCode } = makeError(err);
  console.error(error.message, error);
  return c.json(error, {
    statusCode: statusCode,
  } as any);
}
