import {
  users,
  organizations,
  casePassports,
  donors,
  documents,
  qaAlerts,
  activityLogs,
  chainOfCustody,
  type User,
  type UpsertUser,
  type Organization,
  type InsertOrganization,
  type CasePassport,
  type InsertCasePassport,
  type Donor,
  type InsertDonor,
  type Document,
  type InsertDocument,
  type QaAlert,
  type InsertQaAlert,
  type ActivityLog,
  type InsertActivityLog,
  type ChainOfCustody,
  type InsertChainOfCustody,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, sql } from "drizzle-orm";
import { PHIEncryption, hashForIndex } from "./encryptionService";
import { securityLogger } from "./security";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Organization operations
  getOrganizations(): Promise<Organization[]>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  // Case passport operations
  getCasePassports(organizationId?: string): Promise<CasePassport[]>;
  getCasePassport(id: string): Promise<CasePassport | undefined>;
  createCasePassport(casePassport: InsertCasePassport): Promise<CasePassport>;
  updateCasePassport(id: string, updates: Partial<CasePassport>): Promise<CasePassport>;
  
  // Donor operations
  getDonorByCasePassport(casePassportId: string): Promise<Donor | undefined>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonor(id: string, updates: Partial<Donor>): Promise<Donor>;
  
  // Document operations
  getDocumentsByCasePassport(casePassportId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentStatus(id: string, status: string, reviewedById?: string): Promise<Document>;
  
  // QA Alert operations
  getQaAlerts(organizationId?: string): Promise<QaAlert[]>;
  getQaAlertsByCasePassport(casePassportId: string): Promise<QaAlert[]>;
  createQaAlert(alert: InsertQaAlert): Promise<QaAlert>;
  updateQaAlert(id: string, updates: Partial<QaAlert>): Promise<QaAlert>;
  
  // Activity log operations
  getActivityLogs(casePassportId?: string, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Chain of custody operations
  getChainOfCustody(casePassportId: string): Promise<ChainOfCustody[]>;
  createChainOfCustodyEntry(entry: InsertChainOfCustody): Promise<ChainOfCustody>;
  
  // Dashboard statistics
  getDashboardStats(organizationId?: string): Promise<{
    activeCases: number;
    flaggedDiscrepancies: number;
    auditsPending: number;
    complianceRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Encrypt PHI fields before storing
    const encryptedData = { ...userData };
    if (userData.phoneNumber) {
      encryptedData.phoneNumber = PHIEncryption.encryptPhone(userData.phoneNumber);
      encryptedData.phoneNumberHash = hashForIndex(userData.phoneNumber);
    }
    if (userData.mfaSecret) {
      encryptedData.mfaSecret = PHIEncryption.encryptPhone(userData.mfaSecret);
    }
    
    const [user] = await db
      .insert(users)
      .values(encryptedData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...encryptedData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Log PHI access
    securityLogger.info('PHI Data Updated', {
      userId: userData.id,
      action: 'upsert_user',
      fields: Object.keys(userData)
    });
    
    return user;
  }

  // Organization operations
  async getOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    // Encrypt sensitive organization data
    const encryptedOrg = { ...org };
    if (org.address) {
      encryptedOrg.address = PHIEncryption.encryptAddress(org.address);
      encryptedOrg.addressHash = hashForIndex(org.address);
    }
    if (org.contactPhone) {
      encryptedOrg.contactPhone = PHIEncryption.encryptPhone(org.contactPhone);
    }
    
    const [organization] = await db.insert(organizations).values(encryptedOrg).returning();
    return organization;
  }

  // Case passport operations
  async getCasePassports(organizationId?: string): Promise<CasePassport[]> {
    const query = db.select().from(casePassports).orderBy(desc(casePassports.lastUpdated));
    
    if (organizationId) {
      return await query.where(eq(casePassports.organizationId, organizationId));
    }
    
    return await query;
  }

  async getCasePassport(id: string): Promise<CasePassport | undefined> {
    const [casePassport] = await db.select().from(casePassports).where(eq(casePassports.id, id));
    return casePassport;
  }

  async createCasePassport(casePassport: InsertCasePassport): Promise<CasePassport> {
    const [created] = await db.insert(casePassports).values(casePassport).returning();
    return created;
  }

  async updateCasePassport(id: string, updates: Partial<CasePassport>): Promise<CasePassport> {
    const [updated] = await db
      .update(casePassports)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(casePassports.id, id))
      .returning();
    return updated;
  }

  // Donor operations
  async getDonorByCasePassport(casePassportId: string): Promise<Donor | undefined> {
    const [donor] = await db.select().from(donors).where(eq(donors.casePassportId, casePassportId));
    
    if (donor) {
      // Decrypt PHI fields for authorized access
      if (donor.donorId) {
        donor.donorId = PHIEncryption.decryptSSN(donor.donorId);
      }
      if (donor.dateOfBirth) {
        donor.dateOfBirth = PHIEncryption.decryptDOB(donor.dateOfBirth);
      }
      if (donor.socialSecurityNumber) {
        donor.socialSecurityNumber = PHIEncryption.decryptSSN(donor.socialSecurityNumber);
      }
      if (donor.medicalRecordNumber) {
        donor.medicalRecordNumber = PHIEncryption.decryptMRN(donor.medicalRecordNumber);
      }
      if (donor.causeOfDeath) {
        donor.causeOfDeath = PHIEncryption.decryptPhone(donor.causeOfDeath);
      }
      if (donor.medicalHistory) {
        donor.medicalHistory = PHIEncryption.decryptPhone(donor.medicalHistory);
      }
      if (donor.nextOfKinName) {
        donor.nextOfKinName = PHIEncryption.decryptPhone(donor.nextOfKinName);
      }
      if (donor.nextOfKinPhone) {
        donor.nextOfKinPhone = PHIEncryption.decryptPhone(donor.nextOfKinPhone);
      }
      
      // Log PHI access
      securityLogger.info('PHI Data Accessed', {
        resourceType: 'donor',
        resourceId: donor.id,
        action: 'read_donor'
      });
    }
    
    return donor;
  }

  async createDonor(donor: InsertDonor): Promise<Donor> {
    // Encrypt PHI fields
    const encryptedDonor = { ...donor };
    if (donor.donorId) {
      encryptedDonor.donorId = PHIEncryption.encryptSSN(donor.donorId);
      encryptedDonor.donorIdHash = hashForIndex(donor.donorId);
    }
    if (donor.dateOfBirth) {
      encryptedDonor.dateOfBirth = PHIEncryption.encryptDOB(donor.dateOfBirth);
      encryptedDonor.dateOfBirthHash = hashForIndex(donor.dateOfBirth);
    }
    if (donor.socialSecurityNumber) {
      encryptedDonor.socialSecurityNumber = PHIEncryption.encryptSSN(donor.socialSecurityNumber);
      encryptedDonor.ssnHash = hashForIndex(donor.socialSecurityNumber);
    }
    if (donor.medicalRecordNumber) {
      encryptedDonor.medicalRecordNumber = PHIEncryption.encryptMRN(donor.medicalRecordNumber);
      encryptedDonor.mrnHash = hashForIndex(donor.medicalRecordNumber);
    }
    if (donor.causeOfDeath) {
      encryptedDonor.causeOfDeath = PHIEncryption.encryptPhone(donor.causeOfDeath);
    }
    if (donor.medicalHistory) {
      encryptedDonor.medicalHistory = PHIEncryption.encryptPhone(donor.medicalHistory);
    }
    if (donor.nextOfKinName) {
      encryptedDonor.nextOfKinName = PHIEncryption.encryptPhone(donor.nextOfKinName);
    }
    if (donor.nextOfKinPhone) {
      encryptedDonor.nextOfKinPhone = PHIEncryption.encryptPhone(donor.nextOfKinPhone);
    }
    
    const [created] = await db.insert(donors).values(encryptedDonor).returning();
    
    // Log PHI creation
    securityLogger.info('PHI Data Created', {
      resourceType: 'donor',
      resourceId: created.id,
      action: 'create_donor'
    });
    
    return created;
  }

  async updateDonor(id: string, updates: Partial<Donor>): Promise<Donor> {
    const [updated] = await db.update(donors).set(updates).where(eq(donors.id, id)).returning();
    return updated;
  }

  // Document operations
  async getDocumentsByCasePassport(casePassportId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.casePassportId, casePassportId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [created] = await db.insert(documents).values(document).returning();
    return created;
  }

  async updateDocumentStatus(id: string, status: string, reviewedById?: string): Promise<Document> {
    const updates: any = { status };
    if (reviewedById) {
      updates.reviewedById = reviewedById;
      updates.reviewedAt = new Date();
    }
    
    const [updated] = await db.update(documents).set(updates).where(eq(documents.id, id)).returning();
    return updated;
  }

  // QA Alert operations
  async getQaAlerts(organizationId?: string): Promise<QaAlert[]> {
    if (organizationId) {
      const results = await db
        .select({
          qa_alerts: qaAlerts
        })
        .from(qaAlerts)
        .innerJoin(casePassports, eq(qaAlerts.casePassportId, casePassports.id))
        .where(eq(casePassports.organizationId, organizationId))
        .orderBy(desc(qaAlerts.createdAt));
      
      return results.map(result => result.qa_alerts);
    }
    
    return await db.select().from(qaAlerts).orderBy(desc(qaAlerts.createdAt));
  }

  async getQaAlertsByCasePassport(casePassportId: string): Promise<QaAlert[]> {
    return await db.select().from(qaAlerts).where(eq(qaAlerts.casePassportId, casePassportId));
  }

  async createQaAlert(alert: InsertQaAlert): Promise<QaAlert> {
    const [created] = await db.insert(qaAlerts).values(alert).returning();
    return created;
  }

  async updateQaAlert(id: string, updates: Partial<QaAlert>): Promise<QaAlert> {
    const [updated] = await db.update(qaAlerts).set(updates).where(eq(qaAlerts.id, id)).returning();
    return updated;
  }

  // Activity log operations
  async getActivityLogs(casePassportId?: string, limit: number = 50): Promise<ActivityLog[]> {
    const query = db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
    
    if (casePassportId) {
      return await query.where(eq(activityLogs.casePassportId, casePassportId));
    }
    
    return await query;
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db.insert(activityLogs).values(log).returning();
    return created;
  }

  // Chain of custody operations
  async getChainOfCustody(casePassportId: string): Promise<ChainOfCustody[]> {
    return await db
      .select()
      .from(chainOfCustody)
      .where(eq(chainOfCustody.casePassportId, casePassportId))
      .orderBy(chainOfCustody.timestamp);
  }

  async createChainOfCustodyEntry(entry: InsertChainOfCustody): Promise<ChainOfCustody> {
    const [created] = await db.insert(chainOfCustody).values(entry).returning();
    return created;
  }

  // Dashboard statistics
  async getDashboardStats(organizationId?: string): Promise<{
    activeCases: number;
    flaggedDiscrepancies: number;
    auditsPending: number;
    complianceRate: number;
  }> {
    // Active cases
    const activeCasesConditions = [eq(casePassports.status, 'active')];
    if (organizationId) {
      activeCasesConditions.push(eq(casePassports.organizationId, organizationId));
    }
    const [{ count: activeCases }] = await db
      .select({ count: count() })
      .from(casePassports)
      .where(and(...activeCasesConditions));

    // Flagged discrepancies (open QA alerts)
    let flaggedQuery;
    if (organizationId) {
      flaggedQuery = db
        .select({ count: count() })
        .from(qaAlerts)
        .innerJoin(casePassports, eq(qaAlerts.casePassportId, casePassports.id))
        .where(and(eq(qaAlerts.status, 'open'), eq(casePassports.organizationId, organizationId)));
    } else {
      flaggedQuery = db.select({ count: count() }).from(qaAlerts).where(eq(qaAlerts.status, 'open'));
    }
    const [{ count: flaggedDiscrepancies }] = await flaggedQuery;

    // Audits pending (critical alerts with due dates)
    let auditsQuery;
    if (organizationId) {
      auditsQuery = db
        .select({ count: count() })
        .from(qaAlerts)
        .innerJoin(casePassports, eq(qaAlerts.casePassportId, casePassports.id))
        .where(and(
          eq(qaAlerts.severity, 'critical'),
          eq(qaAlerts.status, 'open'),
          eq(casePassports.organizationId, organizationId)
        ));
    } else {
      auditsQuery = db
        .select({ count: count() })
        .from(qaAlerts)
        .where(and(eq(qaAlerts.severity, 'critical'), eq(qaAlerts.status, 'open')));
    }
    const [{ count: auditsPending }] = await auditsQuery;

    // Compliance rate (simplified calculation)
    const totalCases = activeCases || 1;
    const complianceRate = Math.round(((totalCases - flaggedDiscrepancies) / totalCases) * 100 * 10) / 10;

    return {
      activeCases,
      flaggedDiscrepancies,
      auditsPending,
      complianceRate,
    };
  }
}

export const storage = new DatabaseStorage();
