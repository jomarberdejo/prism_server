import { Hono } from "hono";
import { userHandler } from "@/controllers/users";
const router = new Hono();

router.get("/users", userHandler.getAll);
router.patch("/users/:id", userHandler.updateProfile);
router.get("/users/heads", userHandler.getAllHeads);
router.patch("/users/:id/role", userHandler.updateRole);
router.patch("/users/:id/status", userHandler.updateStatus);

export default router;
