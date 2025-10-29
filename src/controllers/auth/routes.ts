import { Hono } from "hono";
import { authHandler } from "@/controllers/auth";
const router = new Hono();

router.post("/auth/register", authHandler.register);
router.post("/auth/login", authHandler.login);
router.post("/auth/logout", authHandler.logout);

export default router;
