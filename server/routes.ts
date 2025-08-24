import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { auditLogger, logDataAccess, logPhiAccess, securityLogger } from "./security";
import { PHIEncryption } from "./encryptionService";
import { Permission, UserRole, hasPermission } from "@shared/rbac";
import { 
  insertCasePassportSchema, 
  insertDonorSchema, 
  insertDocumentSchema,
  insertQaAlertSchema,
  insertActivityLogSchema,
  insertChainOfCustodySchema 
} from "@shared/schema";
import {
  ObjectStorageService,
  ObjectNotFoundError,
  ObjectPermission,
} from "./objectStorage";

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
    demoUser?: any;
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
          user = await storage.upsertUser({
            id: userId,
            email: req.user?.claims?.email,
            firstName: req.user?.claims?.first_name,
            lastName: req.user?.claims?.last_name,
            profileImageUrl: req.user?.claims?.profile_image_url,
            role: "coordinator",
            organizationId: "org-1",
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

  if (process.env.NODE_ENV === "development") {
    app.head("/api/demo/login", (_req, res) => res.status(200).end());

    app.post("/api/demo/login", auditLogger("demo_login"), async (req: AuthRequest, res) => {
      try {
        const demoUser = {
          id: "demo-user-dev",
          email: "dev@aortamesh.com",
          firstName: "Development",
          lastName: "User",
          role: "admin",
          organizationId: "org-1",
          profileImageUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        req.session.demoUser = demoUser;
        res.json({ success: true, user: demoUser });
      } catch (error) {
        securityLogger.error("Demo login failed", { error });
        res.status(500).json({ message: "Demo login failed" });
      }
    });

    app.post("/api/demo/logout", auditLogger("demo_logout"), async (req: AuthRequest, res) => {
      try {
        req.session.demoUser = undefined;
        res.json({ success: true });
      } catch (error) {
        securityLogger.error("Demo logout failed", { error });
        res.status(500).json({ message: "Demo logout failed" });
      }
    });
  }

  app.get("/api/dashboard/stats", isAuthenticated, auditLogger("dashboard_stats_access"), async (req: AuthRequest, res) => {
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
  });

  // ⬇️ Case passports, donors, documents, QA alerts, activity logs, chain of custody, and object storage routes stay as in your version.
  // All I changed was unified error handling (securityLogger + consistent 500/403/401 responses).

  const httpServer = createServer(app);
  return httpServer;
}
