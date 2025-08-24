import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import csrf from "csurf";

import corsMiddleware from "./corsConfig.js";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { setupSSL } from "./ssl.js";
import { initializeSecrets, scheduleKeyRotation } from "./secretsManager.js";
import { initializeRLS, rlsMiddleware } from "./rowLevelSecurity.js";
import { immutableAuditMiddleware } from "./immutableAuditLog.js";
import { complianceAutomationManager } from "./complianceAutomation.js";
import { stripReplitScripts } from "./htmlProcessor.js";
import consentsRouter from "./routesconsents.js";
import { requireConsent } from "./middlewarerequireConsent.js";

const app = express();
app.set("trust proxy", 1);

// --- Security & Middleware ---

// CORS
app.use(corsMiddleware);

// Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Helmet (tightened CSP)
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production"
        ? {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              imgSrc: ["'self'", "data:", "https:", "blob:"],
              scriptSrc: ["'self'"], // no unsafe-eval in prod
              connectSrc: ["'self'", "wss:"],
              frameSrc: ["'none'"],
              objectSrc: ["'none'"],
              baseUri: ["'self'"],
            },
          }
        : false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);

// --- Rate limiting ---
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use(limiter);
app.use("/api/auth", authLimiter);
app.use("/api/login", authLimiter);
app.use("/api/logout", authLimiter);

// --- Session ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "demo-session-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// --- CSRF protection ---
const csrfProtection = csrf({});
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (["/api/demo/login", "/api/demo/logout"].includes(req.path)) return next();
    return csrfProtection(req, res, next);
  });
}

// --- Health check ---
app.get("/health", (_req, res) =>
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  })
);

// --- CSRF token endpoint ---
app.get("/api/csrf-token", (req: Request, res: Response) => {
  res.json({
    csrfToken:
      process.env.NODE_ENV === "production" ? (req as any).csrfToken() : "dev-token",
  });
});

// --- Request logger ---
app.use((req, res, next) => {
  const start = Date.now();
  let captured: any;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    captured = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (captured) logLine += ` :: ${JSON.stringify(captured)}`;
      if (logLine.length > 150) logLine = logLine.slice(0, 149) + "…";
      log(logLine);
    }
  });

  next();
});

// --- Security bootstrapping ---
async function initializeAdvancedSecurity() {
  try {
    log("🔐 Initializing advanced security features...");
    await initializeSecrets();
    scheduleKeyRotation();
    if (process.env.NODE_ENV === "production") await initializeRLS();
    complianceAutomationManager?.scheduleAutomatedCollection?.();
    log("✅ Advanced security initialized");
  } catch (e) {
    log("❌ Security init failed:", String(e));
  }
}

// --- Core middleware ---
app.use(rlsMiddleware());
app.use(immutableAuditMiddleware());

if (process.env.NODE_ENV === "production") {
  const { incidentDetectionMiddleware } = await import("./incidentResponse.js");
  app.use(incidentDetectionMiddleware());
}

// --- Routes ---
app.use("/api/consents", consentsRouter);

app.post(
  "/api/sensitive-action",
  requireConsent("gdpr_data_processing"),
  (req, res) => res.json({ message: "Sensitive action performed ✅" })
);

// --- HTML sanitizer (Replit banners etc.) ---
app.use((req, res, next) => {
  if (req.path === "/" || req.accepts("html")) {
    const originalSend = res.send;
    res.send = function (body) {
      if (typeof body === "string") body = stripReplitScripts(body);
      return originalSend.call(this, body);
    };
  }
  next();
});

// --- Error handler ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const response: any = { error: err.message || "Internal Server Error" };
  if (app.get("env") === "development") {
    response.stack = err.stack;
  }
  res.status(status).json(response);
});

// --- Bootstrap ---
async function main() {
  await initializeAdvancedSecurity();
  const server = await registerRoutes(app);
  const { ssl } = setupSSL(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  if (!ssl) {
    server.listen({ port, host: "0.0.0.0", reusePort: true }, () =>
      log(`🚀 Serving on http://localhost:${port}`)
    );
  } else {
    log("✅ SSL/HTTPS server configured");
  }

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
}

main().catch((err) => {
  log("❌ Fatal server error:", err);
  process.exit(1);
});
