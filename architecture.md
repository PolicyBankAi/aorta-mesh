# 🧭 AORTA Mesh™ – System Architecture

## 🧩 Overview

AORTA Mesh™ is designed for high-security applications with built-in support for:

- Role-based access
- Consent validation
- Immutable audit logging
- Secrets and encryption lifecycle
- Cloud-native compatibility

---

## 🧱 Layered Architecture

```plaintext
  ┌──────────────────────────────┐
  │         Client (React)       │
  │ TailwindCSS, Radix UI, Vite │
  └────────────┬────────────────┘
               │
     [REST + JSON APIs via HTTPS]
               │
  ┌────────────▼────────────────┐
  │        Express Server       │
  │  - CSRF + Sessions          │
  │  - Consent Middleware       │
  │  - File Upload (Uppy)       │
  └────────────┬────────────────┘
               │
      [Drizzle ORM + PostgreSQL]
               │
  ┌────────────▼────────────────┐
  │     Secrets Management      │
  │  - Vault / KMS Integration  │
  │  - Auto-Rotation Support    │
  └────────────┬────────────────┘
               │
  ┌────────────▼────────────────┐
  │     SSL & Certificate Bot   │
  │  - Let's Encrypt (ACME)     │
  └─────────────────────────────┘
🔐 Security Modules
✅ secretsManager.ts
Supports multiple secret backends (Vault, AWS/GCP/Azure KMS)

Auto-rotates keys every 90 days (configurable)

✅ ssl.ts
Handles automatic certificate provisioning via ACME protocol

Supports multi-domain setups

✅ rowLevelSecurity.ts
Injects WHERE clause filters based on session identity

Useful for RBAC and tenant-based models

🧪 Compliance Modules
Module	Purpose
immutableAuditLog.ts	Logs write-actions in append-only format
requireConsent.ts	Ensures user consent before proceeding
complianceAutomation.ts	Enforces policy based on config

📡 External Integrations
Uppy + Google Cloud Storage – for secure uploads

OpenID Connect + Google Auth – user authentication

Greenlock / ACME – automated SSL certificates

📈 Planned Enhancements
Add full unit test suite (Jest/Vitest)

GraphQL interface (optional module)

CI/CD pipeline with GitHub Actions