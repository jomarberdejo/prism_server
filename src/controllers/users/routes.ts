import { Hono } from "hono";
import { userHandler } from "@/controllers/users";
import { authMiddleware } from "@/middlewares/auth";
const router = new Hono();

router.get("/users", userHandler.getAll);
router.get("/users/heads", userHandler.getAllHeads);
router.patch("/users/change-password", authMiddleware, userHandler.updatePassword);
router.patch("/users/:id", userHandler.updateProfile);
router.patch("/users/:id/role", userHandler.updateRole);
router.patch("/users/:id/status", userHandler.updateStatus);
router.patch("/users/:id/department-head", userHandler.updateDepartmentHeadStatus);
router.delete("/users/:id", userHandler.delete);

export default router;
