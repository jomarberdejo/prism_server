import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { routes } from "./controllers/routes";
import { errorHandlerMiddleware } from "./middlewares/error-handler";

const app = new Hono();

app.onError(errorHandlerMiddleware);

routes.forEach((route) => {
  app.route("/", route);
  console.log(route.routes);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
