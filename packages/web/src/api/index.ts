import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { authMiddleware } from "./middleware/auth";
import { eventsRoutes } from "./routes/events";
import { photosRoutes } from "./routes/photos";
import { postsRoutes } from "./routes/posts";
import { membersRoutes } from "./routes/members";
import { adminRoutes } from "./routes/admin";
import { siteTextsRoutes } from "./routes/site-texts";
import { contactRoutes } from "./routes/contact";

const app = new Hono()
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .basePath("api")
  .use("*", authMiddleware)
  .get("/health", (c) => c.json({ status: "ok" }, 200))
  .route("/events", eventsRoutes)
  .route("/photos", photosRoutes)
  .route("/posts", postsRoutes)
  .route("/members", membersRoutes)
  .route("/admin", adminRoutes)
  .route("/site-texts", siteTextsRoutes)
  .route("/contact", contactRoutes);

export type AppType = typeof app;
export default app;
