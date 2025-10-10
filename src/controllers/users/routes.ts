import { Hono } from "hono";
import { NotFoundError } from "utils/error";

const router = new Hono();

router
  .get("/users", (c) => {
    const user = false;
    if (!user)  {
      throw new NotFoundError("Malformed JSON");
    }
    else{
      return c.text("All Users")
    }
  })
  .get("/users/:id", (c) => c.text("One User"))
  .post("/users", (c) => c.text("Created User"))
  .delete("/users/:id", (c) => c.text("Deleted User"))
  .put("/users", (c) => c.text("Updated User"));

export default router;
