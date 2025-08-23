import { Request, Response } from "express";
import { securityLogger } from "./security";

// Mock Sentry integration (install @sentry/node for real implementation)
interface SentryLike {
  captureException(error: Error, context?: any): void;
  captureMessage(message: string, level?: string): void;
  setUser(user: { id?: string; email?: string }): void;
  setContext(key: string, context: any): void;
}

class MockSentry implements SentryLike {
  captureException(error: Error, context?: any) {
    securityLogger.error("Sentry: Exception captured", {
      error: error.message,
      stack: error.stack,
      context,
    });
  }

  captureMessage(message: string, level?: string) {
    securityLogger.info("Sentry: Message captured", { message, level });
  }

  setUser(user: { id?: string; email?: string }) {}
  setContext(key: string, context: any) {}
}

export const sentry = new MockSentry();

/**
 * Prometheus-style metrics collection
 */
interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

class MetricsCollector {
  private metrics: MetricData[] = [];

  counter(name: string, labels?: Record<string, string>) {
    this.increment(name, 1, labels);
  }

  increment(name: string, value: number = 1, labels?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      labels,
      timestamp: Date.now(),
    };
    this.metrics.push(metric);
    securityLogger.info("Metrics: Counter incremented", { metric: name, value, labels });
  }

  gauge(name: string, value: number, labels?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      labels,
      timestamp: Date.now(),
    };
    this.metrics.push(metric);
    securityLogger.info("Metrics: Gauge set", { metric: name, value, labels });
  }

  histogram(name: string, value: number, labels?: Record<string, string>) {
    const metric: MetricData = {
      name: `${name}_duration`,
      value,
      labels,
      timestamp: Date.now(),
    };
    this.metrics.push(metric);
    securityLogger.info("Metrics: Histogram recorded", { metric: name, duration: value, labels });
  }

  getMetrics(): MetricData[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const metrics = new MetricsCollector();

/**
 * Performance monitoring middleware
 */
export function performanceMonitoring() {
  return (req: Request, res: Response, next: any) => {
    const startTime = Date.now();
    const originalEnd = res.end.bind(res);

    res.end = function (
      chunk?: any,
      encoding?: BufferEncoding | (() => void),
      callback?: () => void
    ): Response {
      const duration = Date.now() - startTime;

      metrics.counter("http_requests_total", {
        method: req.method,
        route: req.path,
        status_code: res.statusCode.toString(),
      });

      metrics.histogram("http_request_duration_ms", duration, {
        method: req.method,
        route: req.path,
      });

      if (duration > 5000) {
        sentry.captureMessage(`Slow request detected: ${req.method} ${req.path}`, "warning");
        securityLogger.warn("Performance: Slow request detected", {
          method: req.method,
          path: req.path,
          duration,
          userAgent: req.get("User-Agent"),
          ip: req.ip,
        });
      }

      if (res.statusCode >= 500) {
        sentry.captureMessage(
          `Server error: ${req.method} ${req.path} - ${res.statusCode}`,
          "error"
        );
        securityLogger.error("Performance: Server error", {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
        });
      }

      return originalEnd(chunk, encoding as BufferEncoding, callback);
    } as typeof res.end;

    next();
  };
}

/**
 * Error tracking middleware
 */
export function errorTracking() {
  return (error: Error, req: Request, res: Response, next: any) => {
    sentry.setContext("request", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    if ((req as any).user?.claims) {
      sentry.setUser({
        id: (req as any).user.claims.sub,
        email: (req as any).user.claims.email,
      });
    }

    sentry.captureException(error);

    metrics.counter("errors_total", {
      type: error.name,
      route: req.path,
      method: req.method,
    });

    securityLogger.error("Application error captured", {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      userId: (req as any).user?.claims?.sub,
    });

    next(error);
  };
}

/**
 * Health check endpoints for monitoring
 */
export function setupHealthChecks(app: any) {
  app.get("/health", (req: Request, res: Response) => {
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    };
    res.json(healthStatus);
  });

  app.get("/health/detailed", (req: Request, res: Response) => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const detailedHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      database: {
        status: "connected", // TODO: Add real DB health check
      },
    };

    res.json(detailedHealth);
  });

  app.get("/metrics", (req: Request, res: Response) => {
    const collectedMetrics = metrics.getMetrics();
    let prometheusMetrics = "";
    const metricGroups: Record<string, MetricData[]> = {};

    collectedMetrics.forEach((metric) => {
      if (!metricGroups[metric.name]) {
        metricGroups[metric.name] = [];
      }
      metricGroups[metric.name].push(metric);
    });

    Object.entries(metricGroups).forEach(([name, metricList]) => {
      prometheusMetrics += `# TYPE ${name} counter\n`;
      metricList.forEach((metric) => {
        const labels = metric.labels
          ? Object.entries(metric.labels)
              .map(([k, v]) => `${k}="${v}"`)
              .join(",")
          : "";
        const labelStr = labels ? `{${labels}}` : "";
        prometheusMetrics += `${name}${labelStr} ${metric.value}\n`;
      });
    });

    res.set("Content-Type", "text/plain");
    res.send(prometheusMetrics);
  });

  securityLogger.info("Health check endpoints configured");
}

/**
 * Security alerts configuration
 */
export interface SecurityAlert {
  level: "info" | "warning" | "critical";
  type: string;
  message: string;
  details: any;
  timestamp: string;
}

class SecurityAlerting {
  private alerts: SecurityAlert[] = [];

  alert(level: SecurityAlert["level"], type: string, message: string, details?: any) {
    const alert: SecurityAlert = {
      level,
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    this.alerts.push(alert);

    (securityLogger as any)[level](`Security Alert: ${type}`, {
      message,
      details,
    });

    if (level === "critical") {
      sentry.captureMessage(`CRITICAL SECURITY ALERT: ${message}`, "error");
    } else if (level === "warning") {
      sentry.captureMessage(`Security Warning: ${message}`, "warning");
    }

    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }

  getRecentAlerts(count: number = 100): SecurityAlert[] {
    return this.alerts.slice(-count);
  }

  getCriticalAlerts(): SecurityAlert[] {
    return this.alerts.filter((alert) => alert.level === "critical");
  }
}

export const securityAlerting = new SecurityAlerting();

export const businessMetrics = {
  casePassportCreated: () => metrics.counter("case_passports_created_total"),
  documentUploaded: () => metrics.counter("documents_uploaded_total"),
  qaAlertCreated: (severity: string) =>
    metrics.counter("qa_alerts_created_total", { severity }),
  userLogin: (role: string) => metrics.counter("user_logins_total", { role }),
  auditLogEntry: (action: string) =>
    metrics.counter("audit_log_entries_total", { action }),

  databaseQueryTime: (operation: string, duration: number) =>
    metrics.histogram("database_query_duration_ms", duration, { operation }),

  authFailure: (reason: string) => metrics.counter("auth_failures_total", { reason }),
  accessDenied: (resource: string) =>
    metrics.counter("access_denied_total", { resource }),
  csrfAttempt: () => metrics.counter("csrf_attempts_total"),
};
