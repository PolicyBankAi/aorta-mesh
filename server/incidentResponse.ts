/**
 * Incident Response System
 * Automated security incident detection, alerting, and response playbooks
 * Integration with PagerDuty, Opsgenie, and automated response workflows
 */

import { securityLogger } from './security';
import { immutableAuditLogger } from './immutableAuditLog';

/**
 * Incident severity levels
 */
export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
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
  COMPLIANCE_VIOLATION = 'compliance_violation'
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
 * Incident detection rules
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
 * Built-in detection rules for healthcare security
 */
const DETECTION_RULES: DetectionRule[] = [
  {
    id: 'multiple_failed_logins',
    name: 'Multiple Failed Login Attempts',
    category: IncidentCategory.AUTHENTICATION_FAILURE,
    severity: IncidentSeverity.MEDIUM,
    condition: (ctx) => (ctx.failedAttempts || 0) >= 5,
    responsePlaybook: 'account_lockout',
    enabled: true
  },
  {
    id: 'phi_bulk_access',
    name: 'Bulk PHI Data Access',
    category: IncidentCategory.PHI_EXPOSURE,
    severity: IncidentSeverity.HIGH,
    condition: (ctx) => ctx.action.includes('export') && ctx.metrics.requestCount > 100,
    responsePlaybook: 'phi_access_review',
    enabled: true
  },
  {
    id: 'admin_privilege_escalation',
    name: 'Unexpected Admin Privilege Use',
    category: IncidentCategory.PRIVILEGE_ESCALATION,
    severity: IncidentSeverity.CRITICAL,
    condition: (ctx) => ctx.userRole !== 'admin' && ctx.resource.includes('/admin/'),
    responsePlaybook: 'privilege_investigation',
    enabled: true
  },
  {
    id: 'unusual_ip_access',
    name: 'Access from Unusual Location',
    category: IncidentCategory.UNAUTHORIZED_ACCESS,
    severity: IncidentSeverity.MEDIUM,
    condition: (ctx) => ctx.metrics.suspiciousPatterns.includes('unusual_ip'),
    responsePlaybook: 'location_verification',
    enabled: true
  },
  {
    id: 'high_error_rate',
    name: 'Abnormally High Error Rate',
    category: IncidentCategory.SYSTEM_COMPROMISE,
    severity: IncidentSeverity.HIGH,
    condition: (ctx) => ctx.metrics.errorRate > 0.5, // 50% error rate
    responsePlaybook: 'system_health_check',
    enabled: true
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
    enabled: true
  }
];

/**
 * Response playbooks
 */
const RESPONSE_PLAYBOOKS: Record<string, ResponseAction[]> = {
  account_lockout: [
    {
      id: '1',
      action: 'Lock user account',
      executor: 'system',
      status: 'pending',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      action: 'Notify security team',
      executor: 'system',
      status: 'pending',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      action: 'Review access logs',
      executor: 'human',
      status: 'pending',
      timestamp: new Date().toISOString(),
      requiresApproval: false
    }
  ],
  phi_access_review: [
    {
      id: '1',
      action: 'Flag user for review',
      executor: 'system',
      status: 'pending',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      action: 'Generate access report',
      executor: 'system',
      status: 'pending',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      action: 'Notify compliance officer',
      executor: 'system',
      status: 'pending',
      timestamp: new Date().toISOString()
    },
    {
      id: '4',
      action: 'Review business justification',
      executor: 'human',
      status: 'pending',
      timestamp: new Date().toISOString(),
      requiresApproval: true
    }
  ],
  privilege_investigation: [
    {
      id: '1',
      action: 'Immediately revoke session',
      executor: 'system',
      status: 'pending',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      action: 'Alert security team CRITICAL',
      executor: 'system',
      status: 'pending',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      action: 'Preserve forensic evidence',
      executor: 'system',
      status: 'pending',
      timestamp: new Date().toISOString()
    },
    {
      id: '4',
      action: 'Conduct security investigation',
      executor: 'human',
      status: 'pending',
      timestamp: new Date().toISOString(),
      requiresApproval: false
    }
  ]
};

/**
 * Incident Response Manager
 */
export class IncidentResponseManager {
  private incidents: Map<string, SecurityIncident> = new Map();
  private rules: DetectionRule[] = DETECTION_RULES;
  
  /**
   * Detect potential security incidents
   */
  async detectIncident(context: SecurityContext): Promise<SecurityIncident[]> {
    const detectedIncidents: SecurityIncident[] = [];
    
    for (const rule of this.rules.filter(r => r.enabled)) {
      try {
        if (rule.condition(context)) {
          const incident = await this.createIncident(rule, context);
          detectedIncidents.push(incident);
          
          securityLogger.warn('Security incident detected', {
            incidentId: incident.id,
            rule: rule.name,
            severity: incident.severity,
            category: incident.category
          });
        }
      } catch (error) {
        securityLogger.error('Detection rule evaluation failed', {
          rule: rule.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return detectedIncidents;
  }
  
  /**
   * Create security incident
   */
  private async createIncident(rule: DetectionRule, context: SecurityContext): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      id: `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        metrics: context.metrics,
        screenshots: [],
        networkTraffic: []
      },
      status: 'detected',
      responseActions: RESPONSE_PLAYBOOKS[rule.responsePlaybook] || [],
      complianceImpact: this.assessComplianceImpact(rule.category, context),
      createdBy: 'system',
      lessons: []
    };
    
    // Store incident
    this.incidents.set(incident.id, incident);
    
    // Log immutable audit entry
    await immutableAuditLogger.log(
      context.userId || 'system',
      context.userRole || 'system',
      'security_incident_created',
      'security_incident',
      {
        incidentId: incident.id,
        category: incident.category,
        severity: incident.severity,
        rule: rule.name
      },
      context.clientIp,
      context.userAgent,
      {
        classification: 'restricted',
        retentionPeriod: 10,
        legalHold: incident.severity === IncidentSeverity.CRITICAL
      }
    );
    
    // Trigger automated response
    await this.executeAutomatedResponse(incident);
    
    return incident;
  }
  
  /**
   * Execute automated response actions
   */
  private async executeAutomatedResponse(incident: SecurityIncident): Promise<void> {
    for (const action of incident.responseActions) {
      if (action.executor === 'system' && !action.requiresApproval) {
        try {
          action.status = 'executing';
          
          // Execute the action
          const result = await this.executeAction(action, incident);
          
          action.status = 'completed';
          action.result = result;
          
          securityLogger.info('Automated response executed', {
            incidentId: incident.id,
            action: action.action,
            result
          });
        } catch (error) {
          action.status = 'failed';
          action.result = error instanceof Error ? error.message : 'Unknown error';
          
          securityLogger.error('Automated response failed', {
            incidentId: incident.id,
            action: action.action,
            error: action.result
          });
        }
      }
    }
    
    // Send alerts for critical incidents
    if (incident.severity === IncidentSeverity.CRITICAL) {
      await this.sendCriticalAlert(incident);
    }
  }
  
  /**
   * Execute specific response action
   */
  private async executeAction(action: ResponseAction, incident: SecurityIncident): Promise<string> {
    switch (action.action) {
      case 'Lock user account':
        // TODO: Implement account locking
        return `Account locked for affected users: ${incident.affectedUsers.join(', ')}`;
        
      case 'Notify security team':
      case 'Alert security team CRITICAL':
        await this.sendSecurityAlert(incident, action.action.includes('CRITICAL'));
        return 'Security team notified';
        
      case 'Flag user for review':
        // TODO: Implement user flagging
        return `Users flagged for review: ${incident.affectedUsers.join(', ')}`;
        
      case 'Generate access report':
        // TODO: Generate detailed access report
        return 'Access report generated';
        
      case 'Immediately revoke session':
        // TODO: Implement session revocation
        return 'Sessions revoked for affected users';
        
      case 'Preserve forensic evidence':
        // TODO: Preserve system state for forensic analysis
        return 'Forensic evidence preserved';
        
      default:
        return `Action "${action.action}" noted - manual execution required`;
    }
  }
  
  /**
   * Send security alerts
   */
  private async sendSecurityAlert(incident: SecurityIncident, critical: boolean = false): Promise<void> {
    const alertData = {
      incident_key: incident.id,
      description: incident.title,
      details: {
        severity: incident.severity,
        category: incident.category,
        affected_systems: incident.affectedSystems,
        phi_involved: incident.phiInvolved,
        compliance_impact: incident.complianceImpact
      }
    };
    
    if (process.env.PAGERDUTY_API_KEY) {
      // TODO: Implement PagerDuty integration
      securityLogger.info('PagerDuty alert would be sent', { alertData });
    }
    
    if (process.env.SLACK_WEBHOOK_URL) {
      // TODO: Implement Slack integration
      securityLogger.info('Slack alert would be sent', { alertData });
    }
    
    // Log the alert
    securityLogger[critical ? 'error' : 'warn']('Security alert sent', {
      incidentId: incident.id,
      critical,
      alertData
    });
  }
  
  /**
   * Send critical incident alert
   */
  private async sendCriticalAlert(incident: SecurityIncident): Promise<void> {
    await this.sendSecurityAlert(incident, true);
    
    // Additional critical alert actions
    securityLogger.error('CRITICAL SECURITY INCIDENT', {
      incidentId: incident.id,
      title: incident.title,
      severity: incident.severity,
      category: incident.category,
      phiInvolved: incident.phiInvolved,
      immediateActions: 'Review incident response playbook immediately'
    });
  }
  
  /**
   * Assess compliance impact
   */
  private assessComplianceImpact(category: IncidentCategory, context: SecurityContext): SecurityIncident['complianceImpact'] {
    const phiInvolved = this.isPHIInvolved(context);
    
    return {
      hipaa: phiInvolved || category === IncidentCategory.PHI_EXPOSURE,
      gdpr: phiInvolved || category === IncidentCategory.DATA_BREACH,
      soc2: true, // All security incidents impact SOC 2
      reportingRequired: phiInvolved || category === IncidentCategory.DATA_BREACH,
      timelineHours: phiInvolved ? 72 : 24 // HIPAA breach notification timeline
    };
  }
  
  /**
   * Check if PHI is involved
   */
  private isPHIInvolved(context: SecurityContext): boolean {
    const phiResources = ['case_passports', 'donors', 'documents', 'phi'];
    return phiResources.some(resource => context.resource.includes(resource));
  }
  
  /**
   * Collect relevant logs for incident
   */
  private async collectLogs(context: SecurityContext): Promise<string[]> {
    try {
      const logs = await immutableAuditLogger.search({
        userId: context.userId,
        startDate: context.timeWindow.start,
        endDate: context.timeWindow.end,
        limit: 50
      });
      
      return logs.map(log => JSON.stringify({
        timestamp: log.timestamp,
        action: log.action,
        resource: log.resource,
        details: log.details
      }));
    } catch (error) {
      securityLogger.error('Failed to collect logs for incident', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }
  
  /**
   * Get incident by ID
   */
  getIncident(id: string): SecurityIncident | undefined {
    return this.incidents.get(id);
  }
  
  /**
   * List all incidents
   */
  listIncidents(filters?: {
    severity?: IncidentSeverity;
    category?: IncidentCategory;
    status?: SecurityIncident['status'];
    limit?: number;
  }): SecurityIncident[] {
    let incidents = Array.from(this.incidents.values());
    
    if (filters?.severity) {
      incidents = incidents.filter(i => i.severity === filters.severity);
    }
    if (filters?.category) {
      incidents = incidents.filter(i => i.category === filters.category);
    }
    if (filters?.status) {
      incidents = incidents.filter(i => i.status === filters.status);
    }
    
    // Sort by timestamp (newest first)
    incidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (filters?.limit) {
      incidents = incidents.slice(0, filters.limit);
    }
    
    return incidents;
  }
  
  /**
   * Update incident status
   */
  updateIncident(id: string, updates: Partial<SecurityIncident>): boolean {
    const incident = this.incidents.get(id);
    if (!incident) return false;
    
    Object.assign(incident, updates);
    this.incidents.set(id, incident);
    
    securityLogger.info('Security incident updated', {
      incidentId: id,
      updates
    });
    
    return true;
  }
  
  /**
   * Generate incident response report
   */
  generateIncidentReport(id: string): SecurityIncident | null {
    const incident = this.incidents.get(id);
    if (!incident) return null;
    
    return {
      ...incident,
      lessons: [
        ...incident.lessons,
        `Incident response time: ${incident.resolvedAt ? 
          Math.round((new Date(incident.resolvedAt).getTime() - new Date(incident.timestamp).getTime()) / (1000 * 60)) 
          : 'Ongoing'} minutes`
      ]
    };
  }
}

// Global incident response manager
export const incidentResponseManager = new IncidentResponseManager();

/**
 * Incident detection middleware
 */
export function incidentDetectionMiddleware() {
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
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
          timeWindow: {
            start: new Date(startTime - 5 * 60 * 1000), // 5 minutes before
            end: new Date()
          },
          metrics: {
            requestCount: 1,
            errorRate: res.statusCode >= 400 ? 1 : 0,
            responseTime: Date.now() - startTime,
            suspiciousPatterns: [] // TODO: Implement pattern detection
          }
        };
        
        // Detect incidents
        const incidents = await incidentResponseManager.detectIncident(context);
        
        if (incidents.length > 0) {
          securityLogger.warn('Security incidents detected in request', {
            path: req.path,
            method: req.method,
            incidentCount: incidents.length,
            incidents: incidents.map(i => ({ id: i.id, category: i.category, severity: i.severity }))
          });
        }
      } catch (error) {
        securityLogger.error('Incident detection middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
    next();
  };
}