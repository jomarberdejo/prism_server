import { Hono } from "hono";
import { userHandler } from "@/controllers/users";
const router = new Hono();

router.get("/users", userHandler.getAll);
router.put("/users/:id", userHandler.updateRole);

export default router;
