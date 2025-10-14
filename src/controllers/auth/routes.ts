import { Context, Hono } from "hono";
import { getCurrentUser, login, logout, refresh, register } from "@/controllers/auth";
import { JWT_SECRET } from "@/constants/cookies";
import { verify } from "hono/jwt";

const router = new Hono();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.post("/auth/refresh", refresh);
router.get("/me", async (c: Context, next) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    console.log(token)
    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const payload =  verify(token, JWT_SECRET, "HS256");
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
}, getCurrentUser);


export default router;
