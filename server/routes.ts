import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { auditLogger, logDataAccess, logPhiAccess } from "./security";
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

// Extended Request type with user session
interface AuthRequest extends Request {
  user?: any;
  session: any; // Allow demoUser property on session
}

// Permission middleware factory
function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user || !user.role) {
      return res.status(403).json({ message: "Forbidden: No role assigned" });
    }
    
    if (!hasPermission(user.role as UserRole, permission)) {
      logPhiAccess(req, 'permission_check', permission, 'deny', false);
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup production authentication
  await setupAuth(app);
  
  // Production authentication endpoints are handled by setupAuth
  // These include /api/login, /api/callback, /api/logout

  // Auth routes - production authentication
  app.get('/api/auth/user', isAuthenticated, auditLogger('user_profile_access'), async (req: AuthRequest, res) => {
    try {
      logDataAccess(req as Request, 'user_profile', 'read');
      logPhiAccess(req as Request, 'user', req.user?.claims?.sub, 'view');
      
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        // Create user if doesn't exist
        const newUser = await storage.upsertUser({
          id: userId,
          email: req.user?.claims?.email,
          firstName: req.user?.claims?.first_name,
          lastName: req.user?.claims?.last_name,
          profileImageUrl: req.user?.claims?.profile_image_url,
          role: 'coordinator',
          organizationId: 'org-1' // Default org, should be set during onboarding
        });
        return res.json(newUser);
      }
      
      // Decrypt sensitive fields if user has permission
      if (user.phoneNumber) {
        user.phoneNumber = PHIEncryption.decryptPhone(user.phoneNumber);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Development-only demo login (disabled in production)
  if (process.env.NODE_ENV === 'development') {
    app.head('/api/demo/login', (req, res) => {
      res.status(200).end();
    });

    app.post('/api/demo/login', auditLogger('demo_login'), async (req: AuthRequest, res) => {
      try {
        // Development demo user for testing
        const demoUser = {
          id: 'demo-user-dev',
          email: 'dev@aortamesh.com',
          firstName: 'Development',
          lastName: 'User',
          role: 'admin', // Admin for full access in dev
          organizationId: 'org-1',
          profileImageUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        req.session.demoUser = demoUser;
        res.json({ success: true, user: demoUser });
      } catch (error) {
        console.error("Demo login error:", error);
        res.status(500).json({ message: "Demo login failed" });
      }
    });

    app.post('/api/demo/logout', auditLogger('demo_logout'), async (req: AuthRequest, res) => {
      try {
        req.session.demoUser = null;
        res.json({ success: true });
      } catch (error) {
        console.error("Demo logout error:", error);
        res.status(500).json({ message: "Demo logout failed" });
      }
    });
  }

  // Dashboard statistics - requires authentication
  app.get('/api/dashboard/stats', isAuthenticated, auditLogger('dashboard_stats_access'), async (req: AuthRequest, res) => {
    try {
      logDataAccess(req as Request, 'dashboard_stats', 'read');
      
      // Get user's organization from session
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const organizationId = user?.organizationId || "org-1";
      
      const stats = await storage.getDashboardStats(organizationId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Case passport routes - requires authentication and permission
  app.get('/api/case-passports', 
    isAuthenticated,
    requirePermission(Permission.VIEW_CASE_PASSPORTS),
    auditLogger('case_passports_list'),
    async (req: AuthRequest, res) => {
      try {
        logDataAccess(req as Request, 'case_passports', 'list');
        
        // Get user's organization
        const userId = req.user?.claims?.sub;
        const user = await storage.getUser(userId);
        const organizationId = user?.organizationId || "org-1";
        
        const casePassports = await storage.getCasePassports(organizationId);
        res.json(casePassports);
      } catch (error) {
        console.error("Error fetching case passports:", error);
        res.status(500).json({ message: "Failed to fetch case passports" });
      }
    }
  );

  app.get('/api/case-passports/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const casePassport = await storage.getCasePassport(id);
      
      if (!casePassport) {
        return res.status(404).json({ message: "Case passport not found" });
      }
      
      res.json(casePassport);
    } catch (error) {
      console.error("Error fetching case passport:", error);
      res.status(500).json({ message: "Failed to fetch case passport" });
    }
  });

  app.post('/api/case-passports', async (req: any, res) => {
    try {
      // Demo mode - use session user
      const demoUser = req.session?.demoUser;
      if (!demoUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertCasePassportSchema.parse({
        ...req.body,
        createdById: demoUser.id,
        organizationId: demoUser.organizationId,
      });
      
      const casePassport = await storage.createCasePassport(validatedData);
      
      // Log the activity
      await storage.createActivityLog({
        casePassportId: casePassport.id,
        userId: demoUser.id,
        action: 'case_passport_created',
        description: `Case passport ${casePassport.caseNumber} created`,
      });
      
      res.status(201).json(casePassport);
    } catch (error) {
      console.error("Error creating case passport:", error);
      res.status(500).json({ message: "Failed to create case passport" });
    }
  });

  // Donor routes
  app.get('/api/case-passports/:id/donor', async (req, res) => {
    try {
      const { id } = req.params;
      const donor = await storage.getDonorByCasePassport(id);
      res.json(donor);
    } catch (error) {
      console.error("Error fetching donor:", error);
      res.status(500).json({ message: "Failed to fetch donor information" });
    }
  });

  app.post('/api/case-passports/:id/donor', async (req: any, res) => {
    try {
      const { id } = req.params;
      // Demo mode - use session user
      const demoUser = req.session?.demoUser;
      if (!demoUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertDonorSchema.parse({
        ...req.body,
        casePassportId: id,
      });
      
      const donor = await storage.createDonor(validatedData);
      
      // Log the activity
      await storage.createActivityLog({
        casePassportId: id,
        userId: demoUser.id,
        action: 'donor_information_added',
        description: 'Donor information added to case passport',
      });
      
      res.status(201).json(donor);
    } catch (error) {
      console.error("Error creating donor:", error);
      res.status(500).json({ message: "Failed to create donor information" });
    }
  });

  // Document routes
  app.get('/api/case-passports/:id/documents', async (req, res) => {
    try {
      const { id } = req.params;
      const documents = await storage.getDocumentsByCasePassport(id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/case-passports/:id/documents', async (req: any, res) => {
    try {
      const { id } = req.params;
      // Demo mode - use session user
      const demoUser = req.session?.demoUser;
      if (!demoUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        casePassportId: id,
        uploadedById: demoUser.id,
      });
      
      const document = await storage.createDocument(validatedData);
      
      // Log the activity
      await storage.createActivityLog({
        casePassportId: id,
        userId: demoUser.id,
        action: 'document_uploaded',
        description: `Document ${document.fileName} uploaded`,
      });
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // QA Alert routes
  app.get('/api/qa-alerts', auditLogger('qa_alerts_access'), async (req: any, res) => {
    try {
      logDataAccess(req, 'qa_alerts', 'read');
      const alerts = await storage.getQaAlerts("org-1");
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching QA alerts:", error);
      res.status(500).json({ message: "Failed to fetch QA alerts" });
    }
  });

  app.post('/api/qa-alerts', async (req: any, res) => {
    try {
      // Demo mode - use session user
      const demoUser = req.session?.demoUser;
      if (!demoUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertQaAlertSchema.parse({
        ...req.body,
        createdById: demoUser.id,
      });
      
      const alert = await storage.createQaAlert(validatedData);
      
      // Log the activity
      await storage.createActivityLog({
        casePassportId: alert.casePassportId,
        userId: demoUser.id,
        action: 'qa_alert_created',
        description: `QA alert created: ${alert.title}`,
      });
      
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating QA alert:", error);
      res.status(500).json({ message: "Failed to create QA alert" });
    }
  });

  // Activity logs
  app.get('/api/activity-logs', auditLogger('activity_logs_access'), async (req, res) => {
    try {
      logDataAccess(req, 'activity_logs', 'read');
      const { casePassportId, limit } = req.query;
      const logs = await storage.getActivityLogs(
        casePassportId as string, 
        limit ? parseInt(limit as string) : 50
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Chain of custody routes
  app.get('/api/case-passports/:id/chain-of-custody', async (req, res) => {
    try {
      const { id } = req.params;
      const chain = await storage.getChainOfCustody(id);
      res.json(chain);
    } catch (error) {
      console.error("Error fetching chain of custody:", error);
      res.status(500).json({ message: "Failed to fetch chain of custody" });
    }
  });

  app.post('/api/case-passports/:id/chain-of-custody', async (req: any, res) => {
    try {
      const { id } = req.params;
      // Demo mode - use session user
      const demoUser = req.session?.demoUser;
      if (!demoUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertChainOfCustodySchema.parse({
        ...req.body,
        casePassportId: id,
        createdById: demoUser.id,
      });
      
      const entry = await storage.createChainOfCustodyEntry(validatedData);
      
      // Log the activity
      await storage.createActivityLog({
        casePassportId: id,
        userId: demoUser.id,
        action: 'chain_of_custody_updated',
        description: `Chain of custody entry added: ${entry.eventType}`,
      });
      
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating chain of custody entry:", error);
      res.status(500).json({ message: "Failed to create chain of custody entry" });
    }
  });

  // Object storage routes for document management
  app.get("/objects/:objectPath(*)", async (req: any, res) => {
    // Demo mode - use session user
    const demoUser = req.session?.demoUser;
    const userId = demoUser?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put("/api/documents/:id/file", async (req: any, res) => {
    if (!req.body.fileURL) {
      return res.status(400).json({ error: "fileURL is required" });
    }

    // Demo mode - use session user
    const demoUser = req.session?.demoUser;
    if (!demoUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.fileURL);

      // Update document with the file path
      const document = await storage.updateDocumentStatus(id, "pending", demoUser.id);
      
      // Log the activity
      await storage.createActivityLog({
        casePassportId: document.casePassportId,
        userId: demoUser.id,
        action: 'document_uploaded',
        description: `Document file uploaded for ${document.fileName}`,
      });
      
      res.status(200).json({
        objectPath: objectPath,
        document,
      });
    } catch (error) {
      console.error("Error setting document file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
