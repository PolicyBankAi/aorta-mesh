# 🧠 AORTA Mesh™ – Secure REST API & Client Platform

**AORTA Mesh™** is a secure, scalable, and extensible platform built with modern technologies to support data-driven applications with strict security and compliance needs.

## 🚀 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, Vite, TailwindCSS, Radix UI
- **Database Layer**: Drizzle ORM + Zod validation
- **Security**: CSRF, Helmet, Rate Limiting, Session Handling
- **Secrets**: Vault / KMS with Auto-Rotation
- **Cert Management**: Automated Let's Encrypt SSL
- **Logging**: Winston-based structured logging
- **File Uploads**: Uppy + Google Cloud Storage
- **Auth**: Passport.js, OpenID Connect, Google OAuth

---

## 📂 Monorepo Structure

Production AortaMesh/
└── AortaTrace/
├── server/ # Express server logic
├── client/ # Frontend React application
├── shared/ # Shared models/types between frontend and backend
├── routes/ # API endpoints
├── middleware/ # Express middlewares (CSRF, Consent, Audit)
├── ssl.ts # SSL automation with Let's Encrypt
├── secretsManager.ts # Multi-provider secrets management
├── drizzle.config.ts # Database schema/migrations
├── tailwind.config.ts # Tailwind CSS setup
└── tsconfig.json # Strict TypeScript configuration

yaml
Copy
Edit

---

## 🔐 Security Highlights

- **✅ CSRF Protection**: via `csurf`, secure + SameSite cookies
- **✅ HTTPS**: automated with Let's Encrypt + Greenlock
- **✅ Secrets Management**: support for Vault, AWS/GCP/Azure KMS
- **✅ Key Rotation**: automated, configurable by environment
- **✅ Consent Enforcement**: user consent router and middleware
- **✅ Immutable Audit Logs**: critical for compliance and investigations
- **✅ Rate Limiting**: prevents abuse and brute-force attacks
- **✅ Secure Sessions**: production-ready session storage

---

## ⚙️ Development

### 🧪 Scripts

| Script       | Purpose                                 |
|--------------|------------------------------------------|
| `dev`        | Start development server with TSX        |
| `build`      | Bundle client and server with Vite/ESBuild |
| `start`      | Run production server                    |
| `check`      | Type-check entire project                |
| `db:push`    | Push database schema using Drizzle       |

---

## 🛠️ Environment Variables

See `.env.example` for a complete list of required environment variables.

---

## 📄 Documentation

- [Security Implementation](./SECURITY_IMPLEMENTATION.md)
- [Advanced Security Features](./ADVANCED_SECURITY_IMPLEMENTATION.md)
- [SSL Setup Guide](./SSL_SETUP.md)

---

## 🤝 Contributing

> Contributions are welcome! Please fork the repo and submit a pull request.

---

## 📜 License

> ⚠️ **License Notice:** This repository is made public solely for transparency and demonstration purposes.  
> **All rights are reserved** by PolicyBankAi/Aorta-Mesh.  
> Unauthorized usage, reproduction, modification, distribution, or deployment of this codebase is strictly prohibited.

Please see the `LICENSE` file for full terms.

