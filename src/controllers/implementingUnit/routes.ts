import { Hono } from "hono";
import { authMiddleware, requireRole } from "@/middlewares/auth";
import { implementingUnitHandler } from "@/controllers/implementingUnit";
const router = new Hono();

router.post(
  "/implementing-units",
  authMiddleware,
  implementingUnitHandler.create,
);
router.get(
  "/implementing-units",
  authMiddleware,
  implementingUnitHandler.getAll,
);
router.delete(
  "/implementing-units/:id",
  authMiddleware,
  implementingUnitHandler.delete,
);
router.patch(
  "/implementing-units/:id",
  authMiddleware,
  implementingUnitHandler.update,
);
router.get(
  "/implementing-units/sector/:sectorId",
  authMiddleware,
  implementingUnitHandler.getBySectorId,
);

export default router;
