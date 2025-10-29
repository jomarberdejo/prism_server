import { Hono } from "hono";
import { ppaHandler } from "@/controllers/ppa";
import { authMiddleware, requireRole } from "@/middlewares/auth";
const router = new Hono();

router.post("/ppas", authMiddleware, ppaHandler.create);
router.post("/ppas/check-availability", ppaHandler.checkAvailability);
router.get("/ppas", authMiddleware, ppaHandler.getAll);
router.get("/ppas/:id", authMiddleware, ppaHandler.getById);
router.patch("/ppas/:id", authMiddleware, ppaHandler.update);
router.delete("/ppas/:id", authMiddleware, ppaHandler.delete);


export default router;
