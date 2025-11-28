export const NODE_ENV = {
  Local: "local",
  Dev: "development",
  Prod: "production",
} as const;

export type ENV_KEY = keyof typeof NODE_ENV;
export type NODE_ENV_TYPE = (typeof NODE_ENV)[ENV_KEY];
