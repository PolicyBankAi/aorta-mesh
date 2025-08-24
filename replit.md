# 🧭 AORTA Mesh™ – Replit Overview

## 📌 Overview
**AORTA Mesh™** (Adaptive Organ & Tissue Record & Traceability Architecture) is a **federated, enterprise-grade web platform** for tissue banks, organ procurement organizations, and transplant centers.  

It generates **cryptographically signed “Case Passports”** for every donor, organ, and tissue lot. This ensures:
- Unified documentation  
- Automated compliance checks  
- Full chain-of-custody tracking  

### Key Capabilities
- HIPAA / AATB / GDPR readiness  
- Federated architecture → keeps PHI local  
- Enterprise scale: **10k concurrent users**, **100k+ cases/year**, **TB-scale docs**  
- Extensible platform with connector marketplace  
- End-to-end compliance + auditability across the lifecycle  

---

## 👤 User Preferences
- **Style:** Simple, everyday language  
- **Goal:** Easy to follow, medical-grade clarity  

---

## 🧱 System Architecture

### 🎨 Frontend
- **Framework:** React + TypeScript  
- **Components:** shadcn/ui (Radix UI)  
- **Styling:** TailwindCSS + custom medical theme  
- **State Management:** TanStack Query  
- **Routing:** Wouter  
- **Build Tool:** Vite  

🔑 **UI/UX Style:**  
- Black background  
- Cyan/teal accents  
- Enlarged AORTA Mesh™ logo  
- Consistent professional medical appearance  

---

### ⚙️ Backend
- **Platform:** Express.js + TypeScript  
- **Features:**  
  - JSON parsing, CORS, logging middleware  
  - OIDC authentication (Replit / external IdPs)  
  - Secure sessions (PostgreSQL store)  
  - REST API endpoints by domain  

- **Security & Compliance:**  
  - Zero Trust RBAC  
  - CSRF protection  
  - Secrets management (Vault / KMS)  
  - PostgreSQL Row-Level Security  
  - Immutable audit logging  
  - AES-256-GCM encryption  
  - Vulnerability scanning  

- **Enterprise Features:**  
  - Admin Console with IAM  
  - SSO / SCIM  
  - Per-tenant encryption  
  - Connector marketplace  

---

### 🗄 Database
- **Database:** PostgreSQL (Neon)  
- **ORM:** Drizzle ORM (type-safe)  
- **Schema:** Organizations, Users, Case Passports, Donors, Docs, QA Alerts, Custody Tracking  
- **Integrity:** Foreign keys + normalized schema  
- **Logging:** Comprehensive audit + document history  

---

### 🔑 Authentication & Authorization
- OIDC authentication (federated)  
- Secure session cookies (server-side)  
- Role-based access (Coordinator, QA, Auditor)  
- Multi-tenant org isolation  

---

### 📂 File Storage & Document Management
- **Hybrid approach:**  
  - Google Cloud Storage → file blobs  
  - PostgreSQL → metadata & references  
- **Upload Handling:** Uppy.js for client upload  

---

## 🔗 External Dependencies

### ☁️ Cloud Infrastructure
- **Neon Database** → Serverless PostgreSQL  
- **Google Cloud Storage** → Object/file storage  
- **Replit Authentication** → OIDC identity provider  

### 🛠 Development & Build Tools
- **Vite** → frontend build  
- **Drizzle Kit** → migrations & schema mgmt  
- **TypeScript** → strong typing  

### 🎨 UI & Components
- **Radix UI** → accessible primitives  
- **shadcn/ui** → styled components  
- **TailwindCSS** → utility-first styling  
- **Lucide React** → icons  

### 📡 Integrations
- **TanStack Query** → server state management  
- **date-fns** → date/time helpers  
- **Uppy** → file upload workflows  
- **Wouter** → routing  
