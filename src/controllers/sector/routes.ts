import { Hono } from "hono";
import { authMiddleware, requireRole } from "@/middlewares/auth";
import { sectorHandler } from "@/controllers/sector";
const router = new Hono();

router.get("/sectors", authMiddleware, sectorHandler.getAll);
router.post("/sectors", authMiddleware, sectorHandler.create);

export default router;
