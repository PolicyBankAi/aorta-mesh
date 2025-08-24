import { Request, Response, NextFunction } from "express";
import { Session, SessionData } from "express-session";
import { logEmergencyAccess } from "./immutableAuditLog";
import { securityLogger } from "./security"; // ✅ central logger

// Extend Express Request with authenticated user + session flags
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    role?: string;
    email?: string;
    [key: string]: any;
  };
  session: Session & Partial<SessionData> & { breakGlass?: boolean };
}

/**
 * Middleware to handle emergency ("break glass") access
 * Requires role=emergency and justification in request
 */
export function emergencyAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.user?.role === "emergency") {
      const justification: string =
        (req.body?.reason || req.query?.reason || "").trim();

      if (!justification) {
        securityLogger.warn("🚨 Emergency access attempt with no justification", {
          userId: req.user?.id,
          endpoint: req.originalUrl,
          ip: req.ip,
        });
        return res
          .status(400)
          .json({ error: "Emergency access requires justification" });
      }

      // 🔒 Immutable audit log entry
      logEmergencyAccess(req.user.id ?? "unknown-user", req.originalUrl, justification, {
        ip: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
        timestamp: new Date().toISOString(),
      });

      // ✅ Flag session for break-glass mode
      req.session.breakGlass = true;

      // Optional: shorten session lifetime
      req.session.cookie.maxAge = 15 * 60 * 1000; // 15 minutes

      securityLogger.info("✅ Emergency access granted", {
        userId: req.user.id,
        endpoint: req.originalUrl,
      });

      return next();
    }

    // Not emergency role → continue normally
    next();
  } catch (err) {
    securityLogger.error("❌ Emergency access middleware error", {
      error: (err as Error).message,
    });
    return res.status(500).json({ error: "Internal server error" });
  }
}
