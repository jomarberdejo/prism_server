import { Hono } from "hono";
import { login, logout, refresh, register } from "@/controllers/auth";

const router = new Hono();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.post("/auth/refresh", refresh);

export default router;
