# 🧭 AORTA Mesh™ – System Architecture

## 🧩 Overview
**AORTA Mesh™** is designed for **high-security, compliance-driven applications** with built-in support for:

- Role-Based Access Control (RBAC)
- User Consent Validation
- Immutable Audit Logging
- Secrets & Encryption Lifecycle Management
- Cloud-Native Deployment Compatibility

---

## 🧱 Layered Architecture

```plaintext
  ┌──────────────────────────────┐
  │          Client Layer        │
  │  React + Vite + TailwindCSS  │
  │  Radix UI components         │
  └────────────┬────────────────┘
               │
     [REST + JSON APIs over HTTPS]
               │
  ┌────────────▼────────────────┐
  │       Express Server        │
  │  - CSRF Protection          │
  │  - Session Management       │
  │  - Consent Middleware       │
  │  - File Uploads (Uppy)      │
  └────────────┬────────────────┘
               │
      [Drizzle ORM → PostgreSQL]
               │
  ┌────────────▼────────────────┐
  │     Secrets Management      │
  │  - Vault / Cloud KMS        │
  │  - Automated Key Rotation   │
  └────────────┬────────────────┘
               │
  ┌────────────▼────────────────┐
  │    SSL & Certificate Bot    │
  │  - Let's Encrypt (ACME)     │
  │  - Multi-domain Support     │
  └─────────────────────────────┘
🔐 Security Modules
secretsManager.ts

Supports multiple secret providers: Vault, AWS/GCP/Azure KMS

Automatic key rotation (default: 90 days, configurable)

ssl.ts

Automated SSL provisioning with ACME (Let’s Encrypt)

Multi-domain and auto-renew support

rowLevelSecurity.ts

Injects RLS filters based on session identity

Enforces tenant and role-based access controls

🧪 Compliance Modules
Module	Purpose
immutableAuditLog.ts	Append-only, tamper-evident logging for write actions
requireConsent.ts	Ensures valid user consent before processing
complianceAutomation.ts	Automates compliance checks and retention enforcement

📡 External Integrations
Uppy + Google Cloud Storage → Secure file upload & storage

OpenID Connect + Google Auth → Federated user authentication

Greenlock / ACME → Automated SSL/TLS certificates

📈 Planned Enhancements
✅ Full unit test coverage (Jest/Vitest)

✅ GraphQL API interface (optional module)

✅ CI/CD pipeline via GitHub Actions

✅ Expanded compliance automation for SOC 2 + ISO 27001

🏥 Summary
AORTA Mesh™ follows a layered Zero Trust architecture with built-in compliance modules, cloud integrations, and enterprise-ready deployment patterns. It provides defense-in-depth security while remaining extensible for future scaling.
