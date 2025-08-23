# replit.md - Compressed

## Overview

AORTA Mesh™ (Adaptive Organ & Tissue Record & Traceability Architecture) is a federated, enterprise-grade web-based platform for tissue banks, organ procurement organizations, and transplant centers. It generates cryptographically signed "Case Passports" for every donor, organ, and tissue lot, ensuring unified documentation, automated compliance checks, and comprehensive chain-of-custody tracking throughout the transplantation process. Key capabilities include HIPAA/AATB/GDPR readiness, a federated architecture that keeps PHI local, high availability, enterprise scalability (10k concurrent users, 100k+ cases/year, TB-scale documents), and an extensible platform with a connector marketplace. The project aims to provide end-to-end compliance and auditability for the organ and tissue banking lifecycle.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, employing a component-based architecture. It uses shadcn/ui (built on Radix UI) for components, Tailwind CSS for styling (with a custom medical theme), TanStack Query for server state management, and Wouter for routing. Vite is used for builds. The UI/UX features a black background with cyan/teal accent colors, an enlarged and consistently themed AORTA Mesh™ logo, and a professional medical platform appearance across all components.

### Backend Architecture
The server is designed as a microservices-ready Express.js API with TypeScript. It uses Express.js with middleware for JSON parsing, CORS, and logging. Authentication is handled via OpenID Connect (OIDC) integration, and session management uses Express sessions with PostgreSQL storage. API endpoints are RESTful and organized by feature domains. The architecture is designed for future migration to microservices with an API Gateway/BFF and event-driven communication. Advanced security implementations include Zero Trust Authentication (RBAC), CSRF protection, secrets management (HashiCorp Vault/AWS KMS integration), PostgreSQL Row-Level Security, immutable audit logging, data encryption (AES-256-GCM), and automated vulnerability scanning. Enterprise readiness features include an Admin Console with IAM, SSO/SCIM, per-tenant encryption, enterprise audit capabilities, and a Connectors marketplace.

### Database Architecture
PostgreSQL is used with Drizzle ORM for type-safe database operations. The schema is normalized for entities like organizations, users, case passports, donors, documents, QA alerts, and chain-of-custody tracking, with foreign key relationships ensuring data integrity. A comprehensive logging system tracks document changes and user actions.

### Authentication & Authorization
A multi-layered security approach includes OIDC-based authentication, server-side sessions with secure cookies, role-based access control (coordinators, QA officers, auditors), and multi-tenant organization isolation.

### File Storage & Document Management
A hybrid storage strategy uses Google Cloud Storage for actual document and file uploads, while metadata and references are stored in PostgreSQL. Uppy.js is integrated for file upload handling.

## External Dependencies

### Cloud Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting.
- **Google Cloud Storage**: Object storage for documents and file attachments.
- **Replit Authentication**: OIDC identity provider for user authentication and authorization.

### Development & Build Tools
- **Vite**: Frontend build tool.
- **Drizzle Kit**: Database migration and schema management.
- **TypeScript**: Type safety across codebase.

### UI & Component Libraries
- **Radix UI**: Unstyled, accessible component primitives.
- **shadcn/ui**: Pre-built component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon system.

### Third-party Integrations
- **TanStack Query**: Server state synchronization and caching.
- **date-fns**: Date manipulation and formatting.
- **Uppy**: File upload handling.
- **Wouter**: Client-side routing solution.