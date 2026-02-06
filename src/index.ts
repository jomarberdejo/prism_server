import 'dotenv/config';
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { routes } from "./controllers/routes";
import { errorHandlerMiddleware } from "./middlewares/error-handler";
import { logger } from "hono/logger";
import { envConfig } from "./config/env";
import { startCronScheduler } from "./services/notificationService";
import { cors } from 'hono/cors';

const app = new Hono();

app.onError(errorHandlerMiddleware);
app.use(logger());
app.use(cors());

routes.forEach((route) => {
  app.route("/api", route);
});

serve(
  {
    fetch: app.fetch,
    port: envConfig.APP_PORT,
    hostname: "0.0.0.0",
  },
  (info) => {
    console.log(`✅ Server is running on http://localhost:${info.port}`);
    startCronScheduler();
  },
);
