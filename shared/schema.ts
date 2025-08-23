import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("coordinator"), // coordinator, qa_officer, auditor, admin, doctor
  organizationId: varchar("organization_id").references(() => organizations.id),
  department: varchar("department"),
  title: varchar("title"),
  phoneNumber: varchar("phone_number"), // Encrypted PHI
  phoneNumberHash: varchar("phone_number_hash"), // For searching
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: varchar("mfa_secret"), // Encrypted
  lastLoginAt: timestamp("last_login_at"),
  loginAttempts: integer("login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  passwordHash: varchar("password_hash"), // For fallback auth
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastPasswordChangeAt: timestamp("last_password_change_at"),
  passwordExpiresAt: timestamp("password_expires_at"),
});

export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // opo, tissue_bank, transplant_center, lab
  address: text("address"), // Encrypted PHI
  addressHash: varchar("address_hash"), // For searching
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"), // Encrypted PHI
  licenseNumber: varchar("license_number"),
  accreditationNumber: varchar("accreditation_number"),
  aatbAccredited: boolean("aatb_accredited").default(false),
  feiNumber: varchar("fei_number"), // FDA Establishment Identifier
  unospId: varchar("unosp_id"), // UNOS Provider ID
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const casePassports = pgTable("case_passports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseNumber: varchar("case_number").unique().notNull(),
  donorId: varchar("donor_id"),
  status: varchar("status").default("active"), // active, completed, archived
  caseType: varchar("case_type").notNull(), // donor, tissue_lot, organ
  organizationId: varchar("organization_id").references(() => organizations.id),
  createdById: varchar("created_by_id").references(() => users.id),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donors = pgTable("donors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  casePassportId: varchar("case_passport_id").references(() => casePassports.id),
  donorId: varchar("donor_id"), // Donor identifier
  donorIdHash: varchar("donor_id_hash"), // For searching encrypted data
  dateOfBirth: varchar("date_of_birth"), // Encrypted PHI
  dateOfBirthHash: varchar("date_of_birth_hash"), // For searching
  age: integer("age"),
  bloodType: varchar("blood_type"),
  gender: varchar("gender"),
  race: varchar("race"),
  ethnicity: varchar("ethnicity"),
  weight: integer("weight"), // in kg
  height: integer("height"), // in cm
  bmi: numeric("bmi", { precision: 5, scale: 2 }),
  socialSecurityNumber: varchar("social_security_number"), // Encrypted PHI
  ssnHash: varchar("ssn_hash"), // For searching
  medicalRecordNumber: varchar("medical_record_number"), // Encrypted PHI
  mrnHash: varchar("mrn_hash"), // For searching
  causeOfDeath: text("cause_of_death"), // Encrypted PHI
  recoveryDate: timestamp("recovery_date"),
  recoveryLocation: varchar("recovery_location"),
  hospitalName: varchar("hospital_name"),
  hospitalId: varchar("hospital_id"),
  medicalHistory: text("medical_history"), // Encrypted PHI
  serologyResults: jsonb("serology_results"), // Encrypted JSON
  hlaTyping: jsonb("hla_typing"), // Encrypted JSON
  infectiousDiseaseTesting: jsonb("infectious_disease_testing"), // Encrypted JSON
  consentType: varchar("consent_type"), // first_person, authorized_agent, medical_examiner
  consentDate: timestamp("consent_date"),
  consentDocumentId: varchar("consent_document_id"),
  nextOfKinName: varchar("next_of_kin_name"), // Encrypted PHI
  nextOfKinRelation: varchar("next_of_kin_relation"),
  nextOfKinPhone: varchar("next_of_kin_phone"), // Encrypted PHI
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  casePassportId: varchar("case_passport_id").references(() => casePassports.id),
  documentType: varchar("document_type").notNull(), // consent_form, serology_results, medical_history, death_certificate, etc
  documentCategory: varchar("document_category"), // medical, legal, laboratory, administrative
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(), // Encrypted if contains PHI
  fileHash: varchar("file_hash"), // SHA-256 hash for integrity
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  encryptionStatus: varchar("encryption_status").default("encrypted"), // encrypted, unencrypted
  encryptionMethod: varchar("encryption_method").default("AES-256-GCM"),
  status: varchar("status").default("pending"), // pending, approved, rejected, expired
  validationErrors: jsonb("validation_errors"),
  uploadedById: varchar("uploaded_by_id").references(() => users.id),
  reviewedById: varchar("reviewed_by_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  digitalSignature: varchar("digital_signature"),
  signedById: varchar("signed_by_id").references(() => users.id),
  signedAt: timestamp("signed_at"),
  expiresAt: timestamp("expires_at"),
  retentionDate: timestamp("retention_date"), // HIPAA retention requirements
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const qaAlerts = pgTable("qa_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  casePassportId: varchar("case_passport_id").references(() => casePassports.id),
  severity: varchar("severity").notNull(), // critical, warning, info
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("open"), // open, in_progress, resolved
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  createdById: varchar("created_by_id").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  casePassportId: varchar("case_passport_id").references(() => casePassports.id),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// HIPAA Access Logs - Tracks all PHI access
export const phiAccessLogs = pgTable("phi_access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  patientId: varchar("patient_id"), // Reference to donor/patient
  resourceType: varchar("resource_type").notNull(), // donor, document, case_passport, etc
  resourceId: varchar("resource_id").notNull(),
  action: varchar("action").notNull(), // view, create, update, delete, export, print
  purpose: varchar("purpose"), // treatment, payment, operations, disclosure
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id"),
  justification: text("justification"), // Required for break-glass access
  accessGranted: boolean("access_granted").default(true),
  denialReason: text("denial_reason"),
  dataFields: jsonb("data_fields"), // Which specific fields were accessed
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Consent Management - HIPAA authorization tracking
export const consentRecords = pgTable("consent_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorId: varchar("donor_id").references(() => donors.id),
  consentType: varchar("consent_type").notNull(), // donation, research, disclosure, marketing
  consentStatus: varchar("consent_status").notNull(), // granted, revoked, expired
  consentScope: jsonb("consent_scope"), // Specific permissions granted
  grantedBy: varchar("granted_by"), // Encrypted - name of person granting consent
  grantedByRelation: varchar("granted_by_relation"), // self, parent, guardian, power_of_attorney
  grantedDate: timestamp("granted_date").notNull(),
  expiresDate: timestamp("expires_date"),
  revokedDate: timestamp("revoked_date"),
  revokedBy: varchar("revoked_by").references(() => users.id),
  revokedReason: text("revoked_reason"),
  documentId: varchar("document_id").references(() => documents.id),
  digitalSignature: text("digital_signature"),
  witnessName: varchar("witness_name"), // Encrypted
  witnessSignature: text("witness_signature"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data Retention Policies - HIPAA compliance
export const dataRetentionPolicies = pgTable("data_retention_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dataType: varchar("data_type").notNull(), // medical_records, consent_forms, lab_results, etc
  retentionPeriod: integer("retention_period").notNull(), // in days
  retentionBasis: varchar("retention_basis"), // hipaa, state_law, organizational_policy
  destructionMethod: varchar("destruction_method"), // secure_delete, shred, anonymize
  legalHoldStatus: boolean("legal_hold_status").default(false),
  description: text("description"),
  effectiveDate: timestamp("effective_date").notNull(),
  reviewDate: timestamp("review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Break-Glass Access - Emergency access override
export const breakGlassAccess = pgTable("break_glass_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  patientId: varchar("patient_id"),
  resourceType: varchar("resource_type").notNull(),
  resourceId: varchar("resource_id").notNull(),
  justification: text("justification").notNull(), // Emergency reason
  emergencyType: varchar("emergency_type"), // life_threatening, urgent_care, disaster
  accessStartTime: timestamp("access_start_time").notNull(),
  accessEndTime: timestamp("access_end_time"),
  supervisorId: varchar("supervisor_id").references(() => users.id),
  supervisorApproval: boolean("supervisor_approval"),
  auditReviewStatus: varchar("audit_review_status").default("pending"), // pending, approved, violation
  auditReviewedBy: varchar("audit_reviewed_by").references(() => users.id),
  auditReviewedAt: timestamp("audit_reviewed_at"),
  auditComments: text("audit_comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tissue/Organ Specifications - AATB compliance
export const tissueSpecifications = pgTable("tissue_specifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  casePassportId: varchar("case_passport_id").references(() => casePassports.id),
  tissueType: varchar("tissue_type").notNull(), // cornea, heart_valve, bone, skin, etc
  tissueSubtype: varchar("tissue_subtype"),
  isotopeNumber: varchar("isotope_number").unique(),
  processingMethod: varchar("processing_method"),
  sterilizationMethod: varchar("sterilization_method"),
  preservationMethod: varchar("preservation_method"),
  storageTemperature: numeric("storage_temperature", { precision: 5, scale: 2 }),
  storageLocation: varchar("storage_location"),
  expirationDate: timestamp("expiration_date"),
  qualityGrade: varchar("quality_grade"),
  dimensions: jsonb("dimensions"), // length, width, height, weight
  microbiologyResults: jsonb("microbiology_results"), // Encrypted
  viabilityTestResults: jsonb("viability_test_results"), // Encrypted
  releaseStatus: varchar("release_status").default("quarantine"), // quarantine, released, recalled
  releasedBy: varchar("released_by").references(() => users.id),
  releasedAt: timestamp("released_at"),
  distributedTo: varchar("distributed_to"),
  distributedAt: timestamp("distributed_at"),
  implantedAt: timestamp("implanted_at"),
  recipientId: varchar("recipient_id"), // Encrypted reference
  surgeonName: varchar("surgeon_name"), // Encrypted
  hospitalName: varchar("hospital_name"),
  outcomeData: jsonb("outcome_data"), // Post-implant tracking
  adverseEvents: jsonb("adverse_events"),
  recallStatus: boolean("recall_status").default(false),
  recallReason: text("recall_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Compliance Audits - Regular compliance checks
export const complianceAudits = pgTable("compliance_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditType: varchar("audit_type").notNull(), // hipaa, aatb, fda, internal
  auditScope: varchar("audit_scope"), // full, partial, focused
  auditPeriodStart: timestamp("audit_period_start").notNull(),
  auditPeriodEnd: timestamp("audit_period_end").notNull(),
  auditorName: varchar("auditor_name"),
  auditorOrganization: varchar("auditor_organization"),
  findings: jsonb("findings"),
  nonConformities: jsonb("non_conformities"),
  correctiveActions: jsonb("corrective_actions"),
  riskAssessment: jsonb("risk_assessment"),
  complianceScore: numeric("compliance_score", { precision: 5, scale: 2 }),
  status: varchar("status").default("in_progress"), // planned, in_progress, completed, follow_up
  reportUrl: varchar("report_url"),
  nextAuditDate: timestamp("next_audit_date"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chainOfCustody = pgTable("chain_of_custody", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  casePassportId: varchar("case_passport_id").references(() => casePassports.id),
  eventType: varchar("event_type").notNull(), // recovery, storage, processing, distribution, transport, disposal
  eventSubtype: varchar("event_subtype"), // Further categorization
  location: varchar("location"),
  locationGps: varchar("location_gps"), // GPS coordinates for tracking
  handlerName: varchar("handler_name"), // Encrypted PHI
  handlerNameHash: varchar("handler_name_hash"), // For searching
  handlerId: varchar("handler_id").references(() => users.id),
  handlerOrganization: varchar("handler_organization"),
  handlerSignature: varchar("handler_signature"), // Digital signature
  recipientName: varchar("recipient_name"), // Encrypted PHI
  recipientId: varchar("recipient_id").references(() => users.id),
  recipientOrganization: varchar("recipient_organization"),
  recipientSignature: varchar("recipient_signature"), // Digital signature
  temperature: varchar("temperature"),
  temperatureUnit: varchar("temperature_unit").default("celsius"),
  temperatureDeviceId: varchar("temperature_device_id"),
  humidity: varchar("humidity"),
  pressure: varchar("pressure"),
  transportMethod: varchar("transport_method"),
  transporterId: varchar("transporter_id"),
  trackingNumber: varchar("tracking_number"),
  containerType: varchar("container_type"),
  containerId: varchar("container_id"),
  sealNumber: varchar("seal_number"),
  timestamp: timestamp("timestamp").notNull(),
  duration: integer("duration"), // Duration in minutes
  notes: text("notes"),
  photoUrl: varchar("photo_url"), // Photo evidence
  verificationMethod: varchar("verification_method"), // barcode, rfid, manual
  verificationData: jsonb("verification_data"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertCasePassportSchema = createInsertSchema(casePassports).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertDonorSchema = createInsertSchema(donors).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertQaAlertSchema = createInsertSchema(qaAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertChainOfCustodySchema = createInsertSchema(chainOfCustody).omit({
  id: true,
  createdAt: true,
});

// Create insert schemas for new tables
export const insertPhiAccessLogSchema = createInsertSchema(phiAccessLogs).omit({
  id: true,
  timestamp: true,
  createdAt: true,
});

export const insertConsentRecordSchema = createInsertSchema(consentRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDataRetentionPolicySchema = createInsertSchema(dataRetentionPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBreakGlassAccessSchema = createInsertSchema(breakGlassAccess).omit({
  id: true,
  createdAt: true,
});

export const insertTissueSpecificationSchema = createInsertSchema(tissueSpecifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComplianceAuditSchema = createInsertSchema(complianceAudits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type CasePassport = typeof casePassports.$inferSelect;
export type InsertCasePassport = z.infer<typeof insertCasePassportSchema>;
export type Donor = typeof donors.$inferSelect;
export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type QaAlert = typeof qaAlerts.$inferSelect;
export type InsertQaAlert = z.infer<typeof insertQaAlertSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ChainOfCustody = typeof chainOfCustody.$inferSelect;
export type InsertChainOfCustody = z.infer<typeof insertChainOfCustodySchema>;
export type PhiAccessLog = typeof phiAccessLogs.$inferSelect;
export type InsertPhiAccessLog = z.infer<typeof insertPhiAccessLogSchema>;
export type ConsentRecord = typeof consentRecords.$inferSelect;
export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;
export type DataRetentionPolicy = typeof dataRetentionPolicies.$inferSelect;
export type InsertDataRetentionPolicy = z.infer<typeof insertDataRetentionPolicySchema>;
export type BreakGlassAccess = typeof breakGlassAccess.$inferSelect;
export type InsertBreakGlassAccess = z.infer<typeof insertBreakGlassAccessSchema>;
export type TissueSpecification = typeof tissueSpecifications.$inferSelect;
export type InsertTissueSpecification = z.infer<typeof insertTissueSpecificationSchema>;
export type ComplianceAudit = typeof complianceAudits.$inferSelect;
export type InsertComplianceAudit = z.infer<typeof insertComplianceAuditSchema>;
