import { Request, Response, NextFunction } from "express";
import { Session, SessionData } from "express-session";
import { logEmergencyAccess } from "./immutableAuditLog";

// Extend Express Request to safely include `user`
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    role?: string;
    [key: string]: any;
  };
  session: Session & Partial<SessionData> & { breakGlass?: boolean };
}

/**
 * Middleware to handle emergency access
 */
export function emergencyAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role === "emergency") {
    logEmergencyAccess(
      req.user.id ?? "unknown-user",
      req.originalUrl,
      req.body.reason || "No justification"
    );

    req.session.breakGlass = true;

    return next();
  }

  next();
}
