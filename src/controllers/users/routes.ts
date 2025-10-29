import { Hono } from "hono";
import { authMiddleware, requireRole } from "@/middlewares/auth";
import {userHandler} from '@/controllers/users'
const router = new Hono();

router.get("/users", authMiddleware, userHandler.getAll);

export default router;
