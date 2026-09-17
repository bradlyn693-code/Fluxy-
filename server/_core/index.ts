import "dotenv/config";
import { createHash, randomBytes } from "node:crypto";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { buildPaymentRequest } from "../payment";
import * as db from "../db";
import { hashPassword, normalizeEmail, validateCredentials, verifyPassword } from "../passwordAuth";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getSessionCookieOptions } from "./cookies";
import { createCustomSessionToken } from "./customAuth";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function registerPaymentRoute(app: express.Express) {
  app.use("/api/pay", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "frame-ancestors *;");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.post("/api/pay", async (req, res) => {
    const { phone, amount, reference } = req.body ?? {};
    const numericAmount = Number(amount);
    const paymentRequest = buildPaymentRequest(String(phone ?? ""), numericAmount);
    if (!paymentRequest) {
      return res.status(400).json({ success: false, error: "A valid phone number and amount are required." });
    }

    const secret = process.env.INTASEND_SECRET_KEY;
    console.log(`[Payment] M-Pesa request phone=${paymentRequest.phone_number} amount=${numericAmount} reference=${String(reference ?? "fluxy").slice(0, 80)}`);

    if (!secret) {
      console.warn("[Payment] INTASEND_SECRET_KEY is not configured; returning demo success.");
      return res.json({ success: true, demo: true, message: "STK sent! Check phone" });
    }

    try {
      const response = await fetch("https://payment.intasend.com/api/v1/payment/mpesa-stk-push/", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify(paymentRequest),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return res.status(response.status).json({ success: false, error: payload?.detail ?? payload?.message ?? "IntaSend payment request failed.", provider: payload });
      return res.json({ success: true, provider: payload });
    } catch (error) {
      console.error("[Payment] IntaSend request failed", error);
      return res.status(502).json({ success: false, error: "Payment provider unavailable." });
    }
  });
}

function registerPasswordAuthRoutes(app: express.Express) {
  const signup = async (req: express.Request, res: express.Response) => {
    const email = normalizeEmail(String(req.body?.email ?? ""));
    const password = String(req.body?.password ?? "");
    const validationError = validateCredentials(email, password);
    if (validationError) return res.status(400).json({ error: validationError });
    try {
      const existingUser = await db.getUserByEmail(email);
      if (existingUser?.passwordHash) return res.status(409).json({ error: "An account with this email already exists." });
      const user = existingUser
        ? await db.setUserPassword(existingUser.id, await hashPassword(password))
        : await db.createEmailUser({ email, passwordHash: await hashPassword(password) });
      if (!user) return res.status(500).json({ error: "Account could not be created." });
      const token = await createCustomSessionToken(user.openId, user.name ?? email);
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      return res.status(201).json({ token, user: { email: user.email, name: user.name } });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      return res.status(500).json({ error: "Account could not be created." });
    }
  };

  app.post("/api/signup", signup);

  app.post("/api/login", async (req, res) => {
    const email = normalizeEmail(String(req.body?.email ?? ""));
    const password = String(req.body?.password ?? "");
    const validationError = validateCredentials(email, password);
    if (validationError) return res.status(400).json({ error: validationError });
    try {
      const user = await db.getUserByEmail(email);
      if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) return res.status(401).json({ error: "Invalid email or password." });
      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
      const token = await createCustomSessionToken(user.openId, user.name ?? email);
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      return res.json({ token, user: { email: user.email, name: user.name } });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      return res.status(500).json({ error: "Login is temporarily unavailable." });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, getSessionCookieOptions(req));
    return res.json({ success: true });
  });

  app.post("/api/request-password-reset", async (req, res) => {
    const email = normalizeEmail(String(req.body?.email ?? ""));
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
    try {
      const user = await db.getUserByEmail(email);
      let deliveryConfigured = false;
      if (user?.passwordHash) {
        const rawToken = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");
        await db.createPasswordResetToken(user.id, tokenHash, new Date(Date.now() + 30 * 60 * 1000));
        const forwardedProto = String(req.headers["x-forwarded-proto"] ?? req.protocol).split(",")[0];
        const baseUrl = process.env.APP_URL || `${forwardedProto}://${req.get("host")}`;
        const resetUrl = `${baseUrl}/update-password?token=${rawToken}`;
        const resendKey = process.env.RESEND_API_KEY;
        const from = process.env.RESEND_FROM_EMAIL;
        if (resendKey && from) {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from,
              to: [email],
              subject: "Reset your Fluxy Tech password",
              html: `<p>Reset your Fluxy Tech password within 30 minutes:</p><p><a href="${resetUrl}">Reset password</a></p>`,
            }),
          });
          deliveryConfigured = emailResponse.ok;
          if (!emailResponse.ok) console.warn("[Auth] Reset email provider rejected the request.");
        } else {
          console.warn("[Auth] Reset token created, but no email provider is configured.");
        }
      }
      return res.json({
        message: "If an account exists for that email, reset instructions have been sent.",
        deliveryConfigured,
      });
    } catch (error) {
      console.error("[Auth] Password reset request failed", error);
      return res.status(500).json({ error: "Password reset is temporarily unavailable." });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    const token = String(req.body?.token ?? "").trim();
    const password = String(req.body?.password ?? "");
    if (!token) return res.status(400).json({ error: "This reset link is invalid or expired." });
    const validationError = validateCredentials("reset@example.com", password);
    if (validationError && validationError !== "Enter a valid email address.") return res.status(400).json({ error: validationError });
    try {
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const resetToken = await db.consumePasswordResetToken(tokenHash);
      if (!resetToken) return res.status(400).json({ error: "This reset link is invalid or expired." });
      const user = await db.getUserById(resetToken.userId);
      if (!user) return res.status(400).json({ error: "This reset link is invalid or expired." });
      await db.setUserPassword(user.id, await hashPassword(password));
      return res.json({ message: "Password updated successfully." });
    } catch (error) {
      console.error("[Auth] Password reset failed", error);
      return res.status(500).json({ error: "Password reset is temporarily unavailable." });
    }
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerPasswordAuthRoutes(app);
  registerPaymentRoute(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  if (process.env.NODE_ENV === "development") await setupVite(app, server);
  else serveStatic(app);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

startServer().catch(console.error);
