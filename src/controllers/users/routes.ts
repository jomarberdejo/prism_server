import { Hono } from "hono";
import { getAllUsers } from ".";
import { requireRole } from "@/middlewares/rbac";
import { authMiddleware } from "@/middlewares/auth";

const router = new Hono();

router.get("/users", authMiddleware, getAllUsers);

export default router;
