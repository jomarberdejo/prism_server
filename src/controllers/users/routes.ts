import { Hono } from "hono";
import { getAllUsers } from ".";
import { requireRole } from "@/middlewares/rbac";

const router = new Hono();

router.get("/users", requireRole(["ADMIN"]) , getAllUsers);

export default router;
