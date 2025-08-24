/**
 * PHI Access Logs - HIPAA compliance
 */
export const phiAccessLogs = pgTable(
  "phi_access_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    patientId: uuid("patient_id"),
    resourceType: varchar("resource_type").notNull(),
    resourceId: varchar("resource_id").notNull(),
    action: varchar("action").notNull(),
    purpose: varchar("purpose"),
    ipAddress: varchar("ip_address"),
    userAgent: text("user_agent"),
    sessionId: varchar("session_id"),
    justification: text("justification"),
    accessGranted: boolean("access_granted").default(true),
    denialReason: text("denial_reason"),
    dataFields: jsonb("data_fields"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("phi_access_user_idx").on(table.userId),
    resourceIdx: index("phi_access_resource_idx").on(table.resourceId),
  }),
);

/**
 * Consent Records
 */
export const consentRecords = pgTable(
  "consent_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    donorId: uuid("donor_id").references(() => donors.id),
    consentType: varchar("consent_type").notNull(),
    consentStatus: varchar("consent_status").notNull(),
    consentScope: jsonb("consent_scope"),
    grantedBy: varchar("granted_by"),
    grantedByRelation: varchar("granted_by_relation"),
    grantedDate: timestamp("granted_date").notNull(),
    expiresDate: timestamp("expires_date"),
    revokedDate: timestamp("revoked_date"),
    revokedBy: uuid("revoked_by").references(() => users.id),
    revokedReason: text("revoked_reason"),
    documentId: uuid("document_id").references(() => documents.id),
    digitalSignature: text("digital_signature"),
    witnessName: varchar("witness_name"),
    witnessSignature: text("witness_signature"),
    createdById: uuid("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    donorIdx: index("consent_records_donor_idx").on(table.donorId),
  }),
);

/**
 * Data Retention Policies
 */
export const dataRetentionPolicies = pgTable(
  "data_retention_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dataType: varchar("data_type").notNull(),
    retentionPeriod: integer("retention_period").notNull(),
    retentionBasis: varchar("retention_basis"),
    destructionMethod: varchar("destruction_method"),
    legalHoldStatus: boolean("legal_hold_status").default(false),
    description: text("description"),
    effectiveDate: timestamp("effective_date").notNull(),
    reviewDate: timestamp("review_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

/**
 * Break-Glass Access (Emergency override)
 */
export const breakGlassAccess = pgTable(
  "break_glass_access",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    patientId: uuid("patient_id"),
    resourceType: varchar("resource_type").notNull(),
    resourceId: varchar("resource_id").notNull(),
    justification: text("justification").notNull(),
    emergencyType: varchar("emergency_type"),
    accessStartTime: timestamp("access_start_time").notNull(),
    accessEndTime: timestamp("access_end_time"),
    supervisorId: uuid("supervisor_id").references(() => users.id),
    supervisorApproval: boolean("supervisor_approval"),
    auditReviewStatus: varchar("audit_review_status").default("pending"),
    auditReviewedBy: uuid("audit_reviewed_by").references(() => users.id),
    auditReviewedAt: timestamp("audit_reviewed_at"),
    auditComments: text("audit_comments"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("break_glass_user_idx").on(table.userId),
    resourceIdx: index("break_glass_resource_idx").on(table.resourceId),
  }),
);

/**
 * Tissue Specifications - AATB compliance
 */
export const tissueSpecifications = pgTable(
  "tissue_specifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    casePassportId: uuid("case_passport_id").references(() => casePassports.id),
    tissueType: varchar("tissue_type").notNull(),
    tissueSubtype: varchar("tissue_subtype"),
    isotopeNumber: varchar("isotope_number").unique(),
    processingMethod: varchar("processing_method"),
    sterilizationMethod: varchar("sterilization_method"),
    preservationMethod: varchar("preservation_method"),
    storageTemperature: numeric("storage_temperature", { precision: 5, scale: 2 }),
    storageLocation: varchar("storage_location"),
    expirationDate: timestamp("expiration_date"),
    qualityGrade: varchar("quality_grade"),
    dimensions: jsonb("dimensions"),
    microbiologyResults: jsonb("microbiology_results"),
    viabilityTestResults: jsonb("viability_test_results"),
    releaseStatus: varchar("release_status").default("quarantine"),
    releasedBy: uuid("released_by").references(() => users.id),
    releasedAt: timestamp("released_at"),
    distributedTo: varchar("distributed_to"),
    distributedAt: timestamp("distributed_at"),
    implantedAt: timestamp("implanted_at"),
    recipientId: varchar("recipient_id"),
    surgeonName: varchar("surgeon_name"),
    hospitalName: varchar("hospital_name"),
    outcomeData: jsonb("outcome_data"),
    adverseEvents: jsonb("adverse_events"),
    recallStatus: boolean("recall_status").default(false),
    recallReason: text("recall_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    caseIdx: index("tissue_spec_case_idx").on(table.casePassportId),
  }),
);

/**
 * Compliance Audits
 */
export const complianceAudits = pgTable(
  "compliance_audits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditType: varchar("audit_type").notNull(),
    auditScope: varchar("audit_scope"),
    auditPeriodStart: timestamp("audit_period_start").notNull(),
    auditPeriodEnd: timestamp("audit_period_end").notNull(),
    auditorName: varchar("auditor_name"),
    auditorOrganization: varchar("auditor_organization"),
    findings: jsonb("findings"),
    nonConformities: jsonb("non_conformities"),
    correctiveActions: jsonb("corrective_actions"),
    riskAssessment: jsonb("risk_assessment"),
    complianceScore: numeric("compliance_score", { precision: 5, scale: 2 }),
    status: varchar("status").default("in_progress"),
    reportUrl: varchar("report_url"),
    nextAuditDate: timestamp("next_audit_date"),
    createdById: uuid("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

/**
 * Chain of Custody
 */
export const chainOfCustody = pgTable(
  "chain_of_custody",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    casePassportId: uuid("case_passport_id").references(() => casePassports.id),
    eventType: varchar("event_type").notNull(),
    eventSubtype: varchar("event_subtype"),
    location: varchar("location"),
    locationGps: varchar("location_gps"),
    handlerName: varchar("handler_name"),
    handlerNameHash: varchar("handler_name_hash"),
    handlerId: uuid("handler_id").references(() => users.id),
    handlerOrganization: varchar("handler_organization"),
    handlerSignature: varchar("handler_signature"),
    recipientName: varchar("recipient_name"),
    recipientId: uuid("recipient_id").references(() => users.id),
    recipientOrganization: varchar("recipient_organization"),
    recipientSignature: varchar("recipient_signature"),
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
    duration: integer("duration"),
    notes: text("notes"),
    photoUrl: varchar("photo_url"),
    verificationMethod: varchar("verification_method"),
    verificationData: jsonb("verification_data"),
    createdById: uuid("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    caseIdx: index("coc_case_idx").on(table.casePassportId),
    handlerIdx: index("coc_handler_idx").on(table.handlerId),
    recipientIdx: index("coc_recipient_idx").on(table.recipientId),
  }),
);
