import { Hono } from "hono";
import { login, logout, register } from "@/controllers/auth";

const router = new Hono();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);

export default router;
