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
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getOrganizations(): Promise<Organization[]>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getCasePassports(organizationId?: string): Promise<CasePassport[]>;
  getCasePassport(id: string): Promise<CasePassport | undefined>;
  createCasePassport(casePassport: InsertCasePassport): Promise<CasePassport>;
  updateCasePassport(id: string, updates: Partial<CasePassport>): Promise<CasePassport>;
  getDonorByCasePassport(casePassportId: string): Promise<Donor | undefined>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonor(id: string, updates: Partial<Donor>): Promise<Donor>;
  getDocumentsByCasePassport(casePassportId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentStatus(id: string, status: string, reviewedById?: string): Promise<Document>;
  getQaAlerts(organizationId?: string): Promise<QaAlert[]>;
  getQaAlertsByCasePassport(casePassportId: string): Promise<QaAlert[]>;
  createQaAlert(alert: InsertQaAlert): Promise<QaAlert>;
  updateQaAlert(id: string, updates: Partial<QaAlert>): Promise<QaAlert>;
  getActivityLogs(casePassportId?: string, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getChainOfCustody(casePassportId: string): Promise<ChainOfCustody[]>;
  createChainOfCustodyEntry(entry: InsertChainOfCustody): Promise<ChainOfCustody>;
  getDashboardStats(organizationId?: string): Promise<{
    activeCases: number;
    flaggedDiscrepancies: number;
    auditsPending: number;
    complianceRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // --- USERS ---
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const encryptedData = { ...userData };
    if (userData.phoneNumber) {
      encryptedData.phoneNumber = PHIEncryption.encryptPhone(userData.phoneNumber);
      encryptedData.phoneNumberHash = hashForIndex(userData.phoneNumber);
    }
    if (userData.mfaSecret) {
      encryptedData.mfaSecret = PHIEncryption.encryptSecret(userData.mfaSecret);
    }

    const [user] = await db
      .insert(users)
      .values(encryptedData)
      .onConflictDoUpdate({
        target: users.id,
        set: { ...encryptedData, updatedAt: new Date() },
      })
      .returning();

    securityLogger.info("PHI Data Updated", {
      userId: userData.id,
      action: "upsert_user",
      fields: Object.keys(userData),
    });

    return user;
  }

  // --- ORGANIZATIONS ---
  async getOrganizations(): Promise<Organization[]> {
    return db.select().from(organizations);
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
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

  // --- CASE PASSPORTS ---
  async getCasePassports(organizationId?: string): Promise<CasePassport[]> {
    let query = db.select().from(casePassports).orderBy(desc(casePassports.lastUpdated));
    if (organizationId) query = query.where(eq(casePassports.organizationId, organizationId));
    return query;
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

  // --- DONORS ---
  async getDonorByCasePassport(casePassportId: string): Promise<Donor | undefined> {
    const [donor] = await db.select().from(donors).where(eq(donors.casePassportId, casePassportId));
    if (!donor) return undefined;

    donor.donorId = donor.donorId ? PHIEncryption.decryptSSN(donor.donorId) : donor.donorId;
    donor.dateOfBirth = donor.dateOfBirth ? PHIEncryption.decryptDOB(donor.dateOfBirth) : donor.dateOfBirth;
    donor.socialSecurityNumber = donor.socialSecurityNumber
      ? PHIEncryption.decryptSSN(donor.socialSecurityNumber)
      : donor.socialSecurityNumber;
    donor.medicalRecordNumber = donor.medicalRecordNumber
      ? PHIEncryption.decryptMRN(donor.medicalRecordNumber)
      : donor.medicalRecordNumber;
    donor.causeOfDeath = donor.causeOfDeath ? PHIEncryption.decryptText(donor.causeOfDeath) : donor.causeOfDeath;
    donor.medicalHistory = donor.medicalHistory ? PHIEncryption.decryptText(donor.medicalHistory) : donor.medicalHistory;
    donor.nextOfKinName = donor.nextOfKinName ? PHIEncryption.decryptText(donor.nextOfKinName) : donor.nextOfKinName;
    donor.nextOfKinPhone = donor.nextOfKinPhone ? PHIEncryption.decryptPhone(donor.nextOfKinPhone) : donor.nextOfKinPhone;

    securityLogger.info("PHI Data Accessed", {
      resourceType: "donor",
      resourceId: donor.id,
      action: "read_donor",
    });

    return donor;
  }

  async createDonor(donor: InsertDonor): Promise<Donor> {
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
    if (donor.causeOfDeath) encryptedDonor.causeOfDeath = PHIEncryption.encryptText(donor.causeOfDeath);
    if (donor.medicalHistory) encryptedDonor.medicalHistory = PHIEncryption.encryptText(donor.medicalHistory);
    if (donor.nextOfKinName) encryptedDonor.nextOfKinName = PHIEncryption.encryptText(donor.nextOfKinName);
    if (donor.nextOfKinPhone) encryptedDonor.nextOfKinPhone = PHIEncryption.encryptPhone(donor.nextOfKinPhone);

    const [created] = await db.insert(donors).values(encryptedDonor).returning();

    securityLogger.info("PHI Data Created", {
      resourceType: "donor",
      resourceId: created.id,
      action: "create_donor",
    });

    return created;
  }

  async updateDonor(id: string, updates: Partial<Donor>): Promise<Donor> {
    const encryptedUpdates = { ...updates };
    if (updates.socialSecurityNumber) {
      encryptedUpdates.socialSecurityNumber = PHIEncryption.encryptSSN(updates.socialSecurityNumber);
      encryptedUpdates.ssnHash = hashForIndex(updates.socialSecurityNumber);
    }
    if (updates.medicalRecordNumber) {
      encryptedUpdates.medicalRecordNumber = PHIEncryption.encryptMRN(updates.medicalRecordNumber);
      encryptedUpdates.mrnHash = hashForIndex(updates.medicalRecordNumber);
    }
    // ... repeat for other PHI fields like DOB, causeOfDeath, etc.

    const [updated] = await db.update(donors).set(encryptedUpdates).where(eq(donors.id, id)).returning();
    return updated;
  }

  // --- DOCUMENTS ---
  async getDocumentsByCasePassport(casePassportId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.casePassportId, casePassportId));
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

  // --- QA ALERTS ---
  async getQaAlerts(organizationId?: string): Promise<QaAlert[]> {
    if (organizationId) {
      const results = await db
        .select({ qa: qaAlerts })
        .from(qaAlerts)
        .innerJoin(casePassports, eq(qaAlerts.casePassportId, casePassports.id))
        .where(eq(casePassports.organizationId, organizationId))
        .orderBy(desc(qaAlerts.createdAt));
      return results.map((r) => r.qa);
    }
    return db.select().from(qaAlerts).orderBy(desc(qaAlerts.createdAt));
  }

  async getQaAlertsByCasePassport(casePassportId: string): Promise<QaAlert[]> {
    return db.select().from(qaAlerts).where(eq(qaAlerts.casePassportId, casePassportId));
  }

  async createQaAlert(alert: InsertQaAlert): Promise<QaAlert> {
    const [created] = await db.insert(qaAlerts).values(alert).returning();
    return created;
  }

  async updateQaAlert(id: string, updates: Partial<QaAlert>): Promise<QaAlert> {
    const [updated] = await db.update(qaAlerts).set(updates).where(eq(qaAlerts.id, id)).returning();
    return updated;
  }

  // --- ACTIVITY LOGS ---
  async getActivityLogs(casePassportId?: string, limit = 50): Promise<ActivityLog[]> {
    let query = db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
    if (casePassportId) query = query.where(eq(activityLogs.casePassportId, casePassportId));
    return query;
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db.insert(activityLogs).values(log).returning();
    return created;
  }

  // --- CHAIN OF CUSTODY ---
  async getChainOfCustody(casePassportId: string): Promise<ChainOfCustody[]> {
    return db
      .select()
      .from(chainOfCustody)
      .where(eq(chainOfCustody.casePassportId, casePassportId))
      .orderBy(chainOfCustody.timestamp);
  }

  async createChainOfCustodyEntry(entry: InsertChainOfCustody): Promise<ChainOfCustody> {
    const [created] = await db.insert(chainOfCustody).values(entry).returning();
    return created;
  }

  // --- DASHBOARD ---
  async getDashboardStats(organizationId?: string) {
    // Active cases
    const activeConditions = [eq(casePassports.status, "active")];
    if (organizationId) activeConditions.push(eq(casePassports.organizationId, organizationId));
    const [{ count: activeCases }] = await db
      .select({ count: count() })
      .from(casePassports)
      .where(and(...activeConditions));

    // Flagged discrepancies
    let flaggedQuery;
    if (organizationId) {
      flaggedQuery = db
        .select({ count: count() })
        .from(qaAlerts)
        .innerJoin(casePassports, eq(qaAlerts.casePassportId, casePassports.id))
        .where(and(eq(qaAlerts.status, "open"), eq(casePassports.organizationId, organizationId)));
    } else {
      flaggedQuery = db.select({ count: count() }).from(qaAlerts).where(eq(qaAlerts.status, "open"));
    }
    const [{ count: flaggedDiscrepancies }] = await flaggedQuery;

    // Audits pending
    let auditsQuery;
    if (organizationId) {
      auditsQuery = db
        .select({ count: count() })
        .from(qaAlerts)
        .innerJoin(casePassports, eq(qaAlerts.casePassportId, casePassports.id))
        .where(
          and(eq(qaAlerts.severity, "critical"), eq(qaAlerts.status, "open"), eq(casePassports.organizationId, organizationId))
        );
    } else {
      auditsQuery = db
        .select({ count: count() })
        .from(qaAlerts)
        .where(and(eq(qaAlerts.severity, "critical"), eq(qaAlerts.status, "open")));
    }
    const [{ count: auditsPending }] = await auditsQuery;

    const totalCases = Number(activeCases) || 1;
    const complianceRate = Math.round(((totalCases - Number(flaggedDiscrepancies)) / totalCases) * 1000) / 10;

    return {
      activeCases: Number(activeCases),
      flaggedDiscrepancies: Number(flaggedDiscrepancies),
      auditsPending: Number(auditsPending),
      complianceRate,
    };
  }
}

export const storage = new DatabaseStorage();
