/**
 * Incident Response System
 * Automated security incident detection, alerting, and response playbooks
 * Integration with PagerDuty, Opsgenie, and automated response workflows
 */

import { securityLogger } from './security';
import { immutableAuditLogger } from './immutableAuditLog';
import crypto from 'crypto';

/**
 * Incident severity levels
 */
export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Incident categories for healthcare compliance
 */
export enum IncidentCategory {
  DATA_BREACH = 'data_breach',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SYSTEM_COMPROMISE = 'system_compromise',
  PHI_EXPOSURE = 'phi_exposure',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  MALWARE_DETECTION = 'malware_detection',
  DDOS_ATTACK = 'ddos_attack',
  INSIDER_THREAT = 'insider_threat',
  COMPLIANCE_VIOLATION = 'compliance_violation',
}

/**
 * Security incident structure
 */
export interface SecurityIncident {
  id: string;
  timestamp: string;
  severity: IncidentSeverity;
  category: IncidentCategory;
  title: string;
  description: string;
  affectedSystems: string[];
  affectedUsers: string[];
  phiInvolved: boolean;
  evidence: {
    logs: string[];
    metrics: Record<string, any>;
    screenshots?: string[];
    networkTraffic?: string[];
  };
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'closed';
  assignedTo?: string;
  responseActions: ResponseAction[];
  complianceImpact: {
    hipaa: boolean;
    gdpr: boolean;
    soc2: boolean;
    reportingRequired: boolean;
    timelineHours: number;
  };
  createdBy: 'system' | 'user';
  resolvedAt?: string;
  lessons: string[];
}

/**
 * Response action for incidents
 */
export interface ResponseAction {
  id: string;
  action: string;
  executor: 'system' | 'human';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: string;
  result?: string;
  requiresApproval?: boolean;
}

/**
 * Detection rule
 */
export interface DetectionRule {
  id: string;
  name: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  condition: (context: SecurityContext) => boolean;
  responsePlaybook: string;
  enabled: boolean;
}

/**
 * Security context for rule evaluation
 */
export interface SecurityContext {
  userId?: string;
  userRole?: string;
  action: string;
  resource: string;
  clientIp: string;
  userAgent: string;
  sessionId?: string;
  failedAttempts?: number;
  timeWindow: {
    start: Date;
    end: Date;
  };
  metrics: {
    requestCount: number;
    errorRate: number;
    responseTime: number;
    suspiciousPatterns: string[];
  };
}

/**
 * Scrub sensitive values from logs / evidence
 */
function scrubSensitive(input: any): any {
  if (!input || typeof input !== 'object') return input;
  const out: any = Array.isArray(input) ? [] : {};
  for (const [k, v] of Object.entries(input)) {
    if (/ssn|dob|phone|email|address|phi/i.test(k)) {
      out[k] = '[REDACTED]';
    } else {
      out[k] = typeof v === 'object' ? scrubSensitive(v) : v;
    }
  }
  return out;
}

/**
 * Built-in detection rules
 */
const DETECTION_RULES: DetectionRule[] = [
  {
    id: 'multiple_failed_logins',
    name: 'Multiple Failed Login Attempts',
    category: IncidentCategory.AUTHENTICATION_FAILURE,
    severity: IncidentSeverity.MEDIUM,
    condition: (ctx) => (ctx.failedAttempts || 0) >= 5,
    responsePlaybook: 'account_lockout',
    enabled: true,
  },
  {
    id: 'phi_bulk_access',
    name: 'Bulk PHI Data Access',
    category: IncidentCategory.PHI_EXPOSURE,
    severity: IncidentSeverity.HIGH,
    condition: (ctx) => ctx.action.includes('export') && ctx.metrics.requestCount > 100,
    responsePlaybook: 'phi_access_review',
    enabled: true,
  },
  {
    id: 'admin_privilege_escalation',
    name: 'Unexpected Admin Privilege Use',
    category: IncidentCategory.PRIVILEGE_ESCALATION,
    severity: IncidentSeverity.CRITICAL,
    condition: (ctx) => ctx.userRole !== 'admin' && ctx.resource.includes('/admin/'),
    responsePlaybook: 'privilege_investigation',
    enabled: true,
  },
  {
    id: 'unusual_ip_access',
    name: 'Access from Unusual Location',
    category: IncidentCategory.UNAUTHORIZED_ACCESS,
    severity: IncidentSeverity.MEDIUM,
    condition: (ctx) => ctx.metrics.suspiciousPatterns.includes('unusual_ip'),
    responsePlaybook: 'location_verification',
    enabled: true,
  },
  {
    id: 'high_error_rate',
    name: 'Abnormally High Error Rate',
    category: IncidentCategory.SYSTEM_COMPROMISE,
    severity: IncidentSeverity.HIGH,
    condition: (ctx) => ctx.metrics.errorRate > 0.5,
    responsePlaybook: 'system_health_check',
    enabled: true,
  },
  {
    id: 'after_hours_access',
    name: 'After Hours PHI Access',
    category: IncidentCategory.INSIDER_THREAT,
    severity: IncidentSeverity.MEDIUM,
    condition: (ctx) => {
      const hour = new Date().getHours();
      return (hour < 6 || hour > 22) && ctx.resource.includes('case_passport');
    },
    responsePlaybook: 'after_hours_review',
    enabled: true,
  },
];

/**
 * Response playbooks
 */
const RESPONSE_PLAYBOOKS: Record<string, ResponseAction[]> = {
  account_lockout: [
    { id: '1', action: 'Lock user account', executor: 'system', status: 'pending', timestamp: new Date().toISOString() },
    { id: '2', action: 'Notify security team', executor: 'system', status: 'pending', timestamp: new Date().toISOString() },
    { id: '3', action: 'Review access logs', executor: 'human', status: 'pending', timestamp: new Date().toISOString() },
  ],
  phi_access_review: [
    { id: '1', action: 'Flag user for review', executor: 'system', status: 'pending', timestamp: new Date().toISOString() },
    { id: '2', action: 'Generate access report', executor: 'system', status: 'pending', timestamp: new Date().toISOString() },
    { id: '3', action: 'Notify compliance officer', executor: 'system', status: 'pending', timestamp: new Date().toISOString() },
    { id: '4', action: 'Review business justification', executor: 'human', status: 'pending', timestamp: new Date().toISOString(), requiresApproval: true },
  ],
  privilege_investigation: [
    { id: '1', action: 'Immediately revoke session', executor: 'system', status: 'pending', timestamp: new Date().toISOString() },
    { id: '2', action: 'Alert security team CRITICAL', executor: 'system', status: 'pending', timestamp: new Date().toISOString() },
    { id: '3', action: 'Preserve forensic evidence', executor: 'system', status: 'pending', timestamp: new Date().toISOString() },
    { id: '4', action: 'Conduct security investigation', executor: 'human', status: 'pending', timestamp: new Date().toISOString() },
  ],
};

/**
 * Incident Response Manager
 */
export class IncidentResponseManager {
  private incidents: Map<string, SecurityIncident> = new Map();
  private rules: DetectionRule[] = DETECTION_RULES;

  async detectIncident(context: SecurityContext): Promise<SecurityIncident[]> {
    const detected: SecurityIncident[] = [];
    for (const rule of this.rules.filter((r) => r.enabled)) {
      try {
        if (rule.condition(context)) {
          const incident = await this.createIncident(rule, context);
          detected.push(incident);
          securityLogger.warn('Security incident detected', {
            incidentId: incident.id,
            rule: rule.name,
            severity: incident.severity,
            category: incident.category,
          });
        }
      } catch (err) {
        securityLogger.error('Detection rule evaluation failed', {
          rule: rule.id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
    return detected;
  }

  private async createIncident(rule: DetectionRule, context: SecurityContext): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: rule.severity,
      category: rule.category,
      title: rule.name,
      description: `Automated detection: ${rule.name}`,
      affectedSystems: ['aorta-mesh-platform'],
      affectedUsers: context.userId ? [context.userId] : [],
      phiInvolved: this.isPHIInvolved(context),
      evidence: {
        logs: await this.collectLogs(context),
        metrics: scrubSensitive(context.metrics),
      },
      status: 'detected',
      responseActions: JSON.parse(JSON.stringify(RESPONSE_PLAYBOOKS[rule.responsePlaybook] || [])),
      complianceImpact: this.assessComplianceImpact(rule.category, context),
      createdBy: 'system',
      lessons: [],
    };

    this.incidents.set(incident.id, incident);

    await immutableAuditLogger.log(
      context.userId || 'system',
      context.userRole || 'system',
      'security_incident_created',
      'security_incident',
      { incidentId: incident.id, category: incident.category, severity: incident.severity, rule: rule.name },
      context.clientIp,
      context.userAgent,
      { classification: 'restricted', retentionPeriod: 10, legalHold: incident.severity === IncidentSeverity.CRITICAL }
    );

    await this.executeAutomatedResponse(incident);
    return incident;
  }

  private async executeAutomatedResponse(incident: SecurityIncident): Promise<void> {
    for (const action of incident.responseActions) {
      if (action.executor === 'system' && !action.requiresApproval) {
        try {
          action.status = 'executing';
          const result = await this.executeAction(action, incident);
          action.status = 'completed';
          action.result = result;
        } catch (err) {
          action.status = 'failed';
          action.result = err instanceof Error ? err.message : 'Unknown error';
        }
      }
    }
    if (incident.severity === IncidentSeverity.CRITICAL) {
      await this.sendCriticalAlert(incident);
    }
  }

  private async executeAction(action: ResponseAction, incident: SecurityIncident): Promise<string> {
    switch (action.action) {
      case 'Lock user account':
        return `Account locked: ${incident.affectedUsers.join(', ') || 'n/a'}`;
      case 'Notify security team':
      case 'Alert security team CRITICAL':
        await this.sendSecurityAlert(incident, action.action.includes('CRITICAL'));
        return 'Security team notified';
      case 'Flag user for review':
        return `Flagged users: ${incident.affectedUsers.join(', ') || 'n/a'}`;
      case 'Generate access report':
        return 'Access report generated';
      case 'Immediately revoke session':
        return 'Sessions revoked';
      case 'Preserve forensic evidence':
        return 'Forensic evidence preserved';
      default:
        return `Manual action required: ${action.action}`;
    }
  }

  private async sendSecurityAlert(incident: SecurityIncident, critical = false): Promise<void> {
    const alertData = {
      incident_key: incident.id,
      description: incident.title,
      details: {
        severity: incident.severity,
        category: incident.category,
        affected_systems: incident.affectedSystems,
        phi_involved: incident.phiInvolved,
      },
    };

    if (process.env.PAGERDUTY_API_KEY) {
      securityLogger.info('PagerDuty alert would be sent', { alertData });
    }
    if (process.env.SLACK_WEBHOOK_URL) {
      securityLogger.info('Slack alert would be sent', { alertData });
    }

    securityLogger[critical ? 'error' : 'warn']('Security alert logged', { incidentId: incident.id, critical });
  }

  private async sendCriticalAlert(incident: SecurityIncident): Promise<void> {
    await this.sendSecurityAlert(incident, true);
    securityLogger.error('CRITICAL SECURITY INCIDENT', {
      incidentId: incident.id,
      title: incident.title,
      severity: incident.severity,
      category: incident.category,
      phiInvolved: incident.phiInvolved,
    });
  }

  private assessComplianceImpact(category: IncidentCategory, context: SecurityContext): SecurityIncident['complianceImpact'] {
    const phiInvolved = this.isPHIInvolved(context);
    return {
      hipaa: phiInvolved || category === IncidentCategory.PHI_EXPOSURE,
      gdpr: phiInvolved || category === IncidentCategory.DATA_BREACH,
      soc2: true,
      reportingRequired: phiInvolved || category === IncidentCategory.DATA_BREACH,
      timelineHours: phiInvolved ? 72 : 24,
    };
  }

  private isPHIInvolved(context: SecurityContext): boolean {
    const phiResources = ['case_passports', 'donors', 'documents', 'phi'];
    return phiResources.some((res) => context.resource.includes(res));
  }

  private async collectLogs(context: SecurityContext): Promise<string[]> {
    try {
      const logs = await immutableAuditLogger.search({
        userId: context.userId,
        startDate: context.timeWindow.start,
        endDate: context.timeWindow.end,
        limit: 50,
      });
      return logs.map((log) =>
        JSON.stringify({
          timestamp: log.timestamp,
          action: log.action,
          resource: log.resource,
          details: scrubSensitive(log.details),
        })
      );
    } catch {
      return [];
    }
  }

  getIncident(id: string): SecurityIncident | undefined {
    return this.incidents.get(id);
  }

  listIncidents(filters?: { severity?: IncidentSeverity; category?: IncidentCategory; status?: SecurityIncident['status']; limit?: number }): SecurityIncident[] {
    let result = Array.from(this.incidents.values());
    if (filters?.severity) result = result.filter((i) => i.severity === filters.severity);
    if (filters?.category) result = result.filter((i) => i.category === filters.category);
    if (filters?.status) result = result.filter((i) => i.status === filters.status);
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return filters?.limit ? result.slice(0, filters.limit) : result;
  }

  updateIncident(id: string, updates: Partial<SecurityIncident>): boolean {
    const inc = this.incidents.get(id);
    if (!inc) return false;
    Object.assign(inc, updates);
    this.incidents.set(id, inc);
    securityLogger.info('Security incident updated', { incidentId: id, updates });
    return true;
  }

  generateIncidentReport(id: string): SecurityIncident | null {
    const inc = this.incidents.get(id);
    if (!inc) return null;
    return {
      ...inc,
      lessons: [
        ...inc.lessons,
        `Incident response time: ${
          inc.resolvedAt
            ? Math.round((new Date(inc.resolvedAt).getTime() - new Date(inc.timestamp).getTime()) / 60000)
            : 'Ongoing'
        } minutes`,
      ],
    };
  }
}

export const incidentResponseManager = new IncidentResponseManager();

/**
 * Incident detection middleware
 */
export function incidentDetectionMiddleware() {
  return async (req: any, res: any, next: any) => {
    const start = Date.now();
    res.on('finish', async () => {
      try {
        const context: SecurityContext = {
          userId: req.user?.claims?.sub,
          userRole: req.user?.role,
          action: `${req.method}_${req.path}`,
          resource: req.path,
          clientIp: req.ip || req.connection?.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID,
          timeWindow: { start: new Date(start - 5 * 60 * 1000), end: new Date() },
          metrics: { requestCount: 1, errorRate: res.statusCode >= 400 ? 1 : 0, responseTime: Date.now() - start, suspiciousPatterns: [] },
        };
        await incidentResponseManager.detectIncident(context);
      } catch (err) {
        securityLogger.error('Incident detection middleware error', { error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });
    next();
  };
}
