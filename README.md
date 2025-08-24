# 🧠 AORTA Mesh™ – Secure REST API & Client Platform

**AORTA Mesh™** is a secure, scalable, and extensible platform built with modern technologies to support **data-driven medical and compliance-heavy applications**.  
It implements **Zero Trust Security**, **HIPAA**, **GDPR**, **SOC 2**, and **AATB compliance features**, making it enterprise-ready for regulated industries.

---

## 🚀 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, Vite, TailwindCSS, Radix UI
- **Database Layer**: Drizzle ORM + Zod Validation
- **Security**: CSRF, Helmet, Rate Limiting, Secure Sessions
- **Secrets**: Vault / KMS (AWS, GCP, Azure) with Auto-Rotation
- **Certificates**: Automated SSL/TLS via Let’s Encrypt (Greenlock)
- **Logging**: Winston Structured Logging + JSON Transport
- **File Uploads**: Uppy + Google Cloud Storage
- **Authentication**: Passport.js, OpenID Connect, Google OAuth

---

## 📂 Monorepo Structure

```txt
AortaMesh/
└── AortaTrace/
    ├── server/              # Express server logic
    ├── client/              # React frontend application
    ├── shared/              # Shared models/types (backend + frontend)
    ├── routes/              # API endpoint definitions
    ├── middleware/          # Express middlewares (CSRF, Consent, Audit, RBAC)
    ├── ssl.ts               # SSL automation with Let's Encrypt
    ├── secretsManager.ts    # Multi-provider secrets manager
    ├── drizzle.config.ts    # Database schema/migrations
    ├── tailwind.config.ts   # Tailwind CSS setup
    └── tsconfig.json        # Strict TypeScript configuration
🔐 Security Highlights
✅ CSRF Protection → csurf, secure + SameSite cookies

✅ HTTPS Everywhere → Automated with Let’s Encrypt + Greenlock

✅ Secrets Management → Vault / AWS / GCP / Azure KMS

✅ Key Rotation → Environment-based, automatic rotation

✅ Consent Enforcement → Middleware + audit-ready consent tracking

✅ Immutable Audit Logs → HIPAA & SOC 2 compliant event trail

✅ Rate Limiting → 1000 general / 5 auth requests per 15 minutes

✅ Secure Session Management → PostgreSQL session storage

✅ Input Validation → Zod schema validation across all endpoints

⚙️ Development
🧪 Scripts
Script	Purpose
dev	Start development server with TSX
build	Bundle client & server (Vite/ESBuild)
start	Run production server
check	Type-check the project with TypeScript
db:push	Push database schema via Drizzle ORM

🛠️ Environment Variables
See .env.example for a complete list of required environment variables.
Production environments must configure secrets via Vault/KMS (not raw .env files).

📄 Documentation
Security Implementation

Advanced Security Features

SSL Setup Guide

🤝 Contributing
Contributions are welcome. Please fork the repo, create a feature branch, and open a pull request.
All contributions must comply with security and compliance guidelines outlined in SECURITY.md.

📜 License
⚠️ License Notice:
This repository is public for transparency and demonstration purposes only.
All rights reserved by PolicyBankAi/Aorta-Mesh.

Unauthorized usage, reproduction, modification, distribution, or deployment of this codebase is strictly prohibited.
See the LICENSE file for full terms.
