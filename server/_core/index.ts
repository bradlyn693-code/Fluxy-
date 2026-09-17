import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { buildPaymentRequest } from "../payment";
import * as db from "../db";
import { hashPassword, normalizeEmail, validateCredentials, verifyPassword } from "../passwordAuth";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
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
  app.post("/api/register", async (req, res) => {
    const email = normalizeEmail(String(req.body?.email ?? ""));
    const password = String(req.body?.password ?? "");
    const validationError = validateCredentials(email, password);
    if (validationError) return res.status(400).json({ error: validationError });
    try {
      if (await db.getUserByEmail(email)) return res.status(409).json({ error: "An account with this email already exists." });
      const user = await db.createEmailUser({ email, passwordHash: await hashPassword(password) });
      if (!user) return res.status(500).json({ error: "Account could not be created." });
      const token = await sdk.createSessionToken(user.openId, { name: user.name ?? email, expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      return res.status(201).json({ token, user: { email: user.email, name: user.name } });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      return res.status(500).json({ error: "Account could not be created." });
    }
  });

  app.post("/api/login", async (req, res) => {
    const email = normalizeEmail(String(req.body?.email ?? ""));
    const password = String(req.body?.password ?? "");
    const validationError = validateCredentials(email, password);
    if (validationError) return res.status(400).json({ error: validationError });
    try {
      const user = await db.getUserByEmail(email);
      if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) return res.status(401).json({ error: "Invalid email or password." });
      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
      const token = await sdk.createSessionToken(user.openId, { name: user.name ?? email, expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      return res.json({ token, user: { email: user.email, name: user.name } });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      return res.status(500).json({ error: "Login is temporarily unavailable." });
    }
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
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
