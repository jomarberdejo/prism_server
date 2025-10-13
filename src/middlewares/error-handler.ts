import { makeError } from "@/utils/error";
import { type Context } from "hono";

export async function errorHandlerMiddleware(err: Error, c: Context) {
  const { error, statusCode } = makeError(err);
  console.error(statusCode, error);
  return c.json(error, {
    status: statusCode,
  } as any);
}

