import { Hono } from "hono";
import { authHandler } from "@/controllers/auth";
import { authMiddleware } from "@/middlewares/auth";
const router = new Hono();

router.post("/auth/register", authHandler.register);
router.post("/auth/login", authHandler.login);
router.post("/auth/logout", authMiddleware, authHandler.logout);
router.post("/auth/forgot-password", authHandler.forgotPassword);
router.post("/auth/verify-otp",      authHandler.verifyOTP);
router.post("/auth/reset-password",  authHandler.resetPassword);

export default router;
