import { Request, Response, NextFunction } from "express";
import { securityLogger } from "./security";

// ✅ Try to load Sentry, fallback to mock if not available
let Sentry: any = null;
try {
  Sentry = require("@sentry/node");
} catch {
  securityLogger.warn("Sentry not installed — using mock implementation");
}

// --- Sentry Integration (real or mock) ---
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
  setUser(_user: { id?: string; email?: string }) {}
  setContext(_key: string, _context: any) {}
}

export const sentry: SentryLike = Sentry ? Sentry : new MockSentry();

// --- Prometheus Metrics Collector ---
interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  type: "counter" | "gauge" | "histogram";
  timestamp: number;
}

class MetricsCollector {
  private metrics: MetricData[] = [];

  private record(
    type: "counter" | "gauge" | "histogram",
    name: string,
    value: number,
    labels?: Record<string, string>
  ) {
    const metric: MetricData = { name, value, labels, type, timestamp: Date.now() };
    this.metrics.push(metric);

    // Prevent unbounded memory growth
    if (this.metrics.length > 50_000) {
      this.metrics = this.metrics.slice(-25_000);
    }

    securityLogger.info(`Metrics: ${type} recorded`, { name, value, labels });
  }

  counter(name: string, labels?: Record<string, string>) {
    this.record("counter", name, 1, labels);
  }

  increment(name: string, value: number = 1, labels?: Record<string, string>) {
    this.record("counter", name, value, labels);
  }

  gauge(name: string, value: number, labels?: Record<string, string>) {
    this.record("gauge", name, value, labels);
  }

  histogram(name: string, value: number, labels?: Record<string, string>) {
    this.record("histogram", `${name}_duration_ms`, value, labels);
  }

  getMetrics(): MetricData[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const metrics = new MetricsCollector();

// --- Performance Monitoring Middleware ---
export function performanceMonitoring() {
  return (req: Request, res: Response, next: NextFunction) => {
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

      metrics.histogram("http_request_duration", duration, {
        method: req.method,
        route: req.path,
      });

      if (duration > 5000) {
        sentry.captureMessage(
          `Slow request detected: ${req.method} ${req.path} (${duration}ms)`,
          "warning"
        );
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

// --- Error Tracking Middleware ---
export function errorTracking() {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
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

// --- Health Check Endpoints ---
export function setupHealthChecks(app: any) {
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    });
  });

  app.get("/health/detailed", async (_req: Request, res: Response) => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // TODO: Replace with real DB ping (ex: SELECT 1)
    const dbHealthy = true;

    res.json({
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
        status: dbHealthy ? "connected" : "disconnected",
      },
    });
  });

  app.get("/metrics", (_req: Request, res: Response) => {
    const collected = metrics.getMetrics();
    let output = "";

    const grouped: Record<string, MetricData[]> = {};
    collected.forEach((m) => {
      if (!grouped[m.name]) grouped[m.name] = [];
      grouped[m.name].push(m);
    });

    Object.entries(grouped).forEach(([name, metricsList]) => {
      output += `# TYPE ${name} ${metricsList[0].type}\n`;
      metricsList.forEach((m) => {
        const labels = m.labels
          ? `{${Object.entries(m.labels)
              .map(([k, v]) => `${k}="${v}"`)
              .join(",")}}`
          : "";
        output += `${name}${labels} ${m.value}\n`;
      });
    });

    res.set("Content-Type", "text/plain");
    res.send(output);
  });

  securityLogger.info("Health check & metrics endpoints configured");
}

// --- Security Alerts ---
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

    // Trim alerts buffer
    if (this.alerts.length > 1000) this.alerts = this.alerts.slice(-500);

    // Route to logger
    (securityLogger as any)[level](`Security Alert: ${type}`, { message, details });

    // Route to Sentry
    if (level === "critical") {
      sentry.captureMessage(`CRITICAL SECURITY ALERT: ${message}`, "error");
    } else if (level === "warning") {
      sentry.captureMessage(`Security Warning: ${message}`, "warning");
    }
  }

  getRecentAlerts(count: number = 100): SecurityAlert[] {
    return this.alerts.slice(-count);
  }

  getCriticalAlerts(): SecurityAlert[] {
    return this.alerts.filter((a) => a.level === "critical");
  }
}

export const securityAlerting = new SecurityAlerting();

// --- Business-Level Metrics Shortcuts ---
export const businessMetrics = {
  casePassportCreated: () => metrics.counter("case_passports_created_total"),
  documentUploaded: () => metrics.counter("documents_uploaded_total"),
  qaAlertCreated: (severity: string) =>
    metrics.counter("qa_alerts_created_total", { severity }),
  userLogin: (role: string) => metrics.counter("user_logins_total", { role }),
  auditLogEntry: (action: string) =>
    metrics.counter("audit_log_entries_total", { action }),

  databaseQueryTime: (operation: string, duration: number) =>
    metrics.histogram("database_query", duration, { operation }),

  authFailure: (reason: string) => metrics.counter("auth_failures_total", { reason }),
  accessDenied: (resource: string) =>
    metrics.counter("access_denied_total", { resource }),
  csrfAttempt: () => metrics.counter("csrf_attempts_total"),
};
