import 'dotenv/config';
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { routes } from "./controllers/routes";
import { errorHandlerMiddleware } from "./middlewares/error-handler";
import { logger } from "hono/logger";
import { envConfig } from "./env";
import { startCronScheduler } from "./services/notificationService";


const app = new Hono();

app.onError(errorHandlerMiddleware);
app.use(logger());

routes.forEach((route) => {
  app.route("/", route);
});


serve(
  {
    fetch: app.fetch,
    port: envConfig.APP_PORT,
  },
  (info) => {
    console.log(`✅ Server is running on http://localhost:${info.port}`);
    startCronScheduler();
  },
);
