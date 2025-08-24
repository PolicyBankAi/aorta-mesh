import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { auditLogger, logDataAccess, logPhiAccess, securityLogger } from "./security";
import { PHIEncryption } from "./encryptionService";
import { Permission, UserRole, hasPermission } from "@shared/rbac";
import {
  ObjectStorageService,
  ObjectNotFoundError,
  ObjectPermission,
} from "./objectStorage";

// ✅ TEMP STUBS (until schemas are defined in shared/schema.ts)
const insertCasePassportSchema = {};
const insertDonorSchema = {};
const insertDocumentSchema = {};
const insertQaAlertSchema = {};
const insertActivityLogSchema = {};
const insertChainOfCustodySchema = {};

interface AuthRequest extends Request {
  user?: {
    claims?: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      profile_image_url?: string;
    };
    role?: UserRole;
  };
  session: {
    [key: string]: any;
  };
}

function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", code: "UNAUTHORIZED" });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user?.role) {
        return res.status(403).json({ message: "Forbidden: No role assigned", code: "FORBIDDEN" });
      }

      if (!hasPermission(user.role as UserRole, permission)) {
        logPhiAccess(req, "permission_check", permission, "deny", false);
        return res.status(403).json({ message: "Forbidden: Insufficient permissions", code: "FORBIDDEN" });
      }

      next();
    } catch (err) {
      securityLogger.error("Permission check failed", {
        error: err instanceof Error ? err.message : String(err),
        userId,
        permission,
      });
      return res.status(500).json({ message: "Internal error", code: "INTERNAL_ERROR" });
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // ✅ Authenticated user profile
  app.get(
    "/api/auth/user",
    isAuthenticated,
    auditLogger("user_profile_access"),
    async (req: AuthRequest, res) => {
      try {
        logDataAccess(req, "user_profile", "read");
        logPhiAccess(req, "user", req.user?.claims?.sub, "view");

        const userId = req.user?.claims?.sub;
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        let user = await storage.getUser(userId);
        if (!user) {
          // If user doesn’t exist yet → create baseline record
          user = await storage.upsertUser({
            id: userId,
            email: req.user?.claims?.email,
            firstName: req.user?.claims?.first_name,
            lastName: req.user?.claims?.last_name,
            profileImageUrl: req.user?.claims?.profile_image_url,
            role: "coordinator", // default role, adjust as needed
            organizationId: "org-1", // default org, adjust as needed
          });
        }

        if (user.phoneNumber) {
          user.phoneNumber = PHIEncryption.decryptPhone(user.phoneNumber);
        }

        res.json(user);
      } catch (error) {
        securityLogger.error("Error fetching user profile", { error });
        res.status(500).json({ message: "Failed to fetch user" });
      }
    }
  );

  // ✅ Dashboard stats route
  app.get(
    "/api/dashboard/stats",
    isAuthenticated,
    auditLogger("dashboard_stats_access"),
    async (req: AuthRequest, res) => {
      try {
        logDataAccess(req, "dashboard_stats", "read");
        const userId = req.user?.claims?.sub;
        const user = userId ? await storage.getUser(userId) : null;
        const stats = await storage.getDashboardStats(user?.organizationId || "org-1");
        res.json(stats);
      } catch (error) {
        securityLogger.error("Error fetching dashboard stats", { error });
        res.status(500).json({ message: "Failed to fetch dashboard statistics" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
