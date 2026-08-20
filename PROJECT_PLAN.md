# CivicConnect India - Project Plan

## Overview

CivicConnect India is a production-quality civic complaint and public issue reporting platform for India. Citizens photograph civic problems, and the platform identifies the issue via AI, determines the responsible department, generates a professional complaint, routes it through the appropriate channel, and enables status tracking.

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend (Citizen) | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui | SSR, App Router, modern DX |
| Frontend (Admin) | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui | Same stack, separate app |
| Backend API | NestJS, TypeScript | Modular, scalable, enterprise-grade |
| Database | PostgreSQL 16 + PostGIS | Spatial queries, relational integrity |
| ORM | Prisma | Type-safe, migrations, excellent DX |
| Cache/Queue | Redis + BullMQ | Background jobs, caching |
| Object Storage | MinIO (dev), S3-compatible (prod) | Image storage |
| Auth | JWT + Email OTP | Stateless, scalable |
| Maps | Leaflet + OpenStreetMap (MVP), provider abstraction | Free, no API key needed for MVP |
| AI/ML | Provider abstraction, OpenAI Vision API initial | Replaceable classifier |
| i18n | next-intl | English, Hindi, Marathi |
| Monorepo | Turborepo | Build orchestration |
| Containerization | Docker + Docker Compose | Local development |

## Phases

### Phase 1: Architecture & Project Setup
- [x] Repository inspection
- [ ] Create documentation (PROJECT_PLAN.md, ARCHITECTURE.md, DATABASE.md, API.md)
- [ ] Initialize monorepo with Turborepo
- [ ] Configure shared packages (types, ui, config, utils)
- [ ] Docker Compose for PostgreSQL/PostGIS, Redis, MinIO
- [ ] Environment variable templates

### Phase 2: Database
- [ ] Prisma schema with all entities
- [ ] PostGIS extension setup
- [ ] Migrations
- [ ] Seed data (demo authorities, departments, categories)
- [ ] Indexes (user_id, status, category_id, GIST on location)

### Phase 3: Backend Foundation
- [ ] NestJS project with module structure
- [ ] Global error handling & standardized responses
- [ ] Request logging with request_id
- [ ] Health check endpoint
- [ ] Config/environment module
- [ ] Prisma service integration
- [ ] Redis connection
- [ ] BullMQ queue setup
- [ ] Image upload with validation (MIME, size, dimensions)
- [ ] S3-compatible storage service

### Phase 4: Authentication
- [ ] User registration (email + password)
- [ ] Email OTP verification architecture
- [ ] JWT access/refresh tokens
- [ ] Login/logout
- [ ] Admin authentication (separate)
- [ ] RBAC middleware (SUPER_ADMIN, AUTHORITY_ADMIN, DEPARTMENT_ADMIN, OFFICER, VIEWER)
- [ ] Session management

### Phase 5: Citizen Portal UI
- [ ] Homepage (Hero, How It Works, Categories, FAQ, Footer)
- [ ] Layout & navigation
- [ ] Auth pages (register, login)
- [ ] i18n setup (en, hi, mr)
- [ ] Responsive mobile-first design
- [ ] Design system components (Button, Input, Card, Badge, Toast, etc.)

### Phase 6: Complaint Creation Flow
- [ ] Multi-step wizard UI
- [ ] Step 1: Image upload (camera/file, client-side compression, validation)
- [ ] Step 2: Location (browser geolocation, map picker, manual entry)
- [ ] Step 3: AI analysis display (category, confidence, severity)
- [ ] Step 4: Category confirmation/manual selection
- [ ] Step 5: AI-generated complaint with edit capability
- [ ] Step 6: Review & submit
- [ ] Complaint API integration

### Phase 7: Image Processing
- [ ] Server-side image validation (MIME, magic bytes, size, dimensions)
- [ ] EXIF metadata extraction (GPS, timestamp, device)
- [ ] EXIF stripping for public copies
- [ ] Thumbnail generation
- [ ] Signed URL generation
- [ ] Filename sanitization & internal key generation

### Phase 8: AI Classification
- [ ] ImageClassifier abstraction/interface
- [ ] OpenAI Vision API implementation
- [ ] Classification: category, subcategory, confidence, severity, evidence
- [ ] Complaint text generation
- [ ] Fallback to manual category selection
- [ ] AI unavailability handling

### Phase 9: Geolocation
- [ ] Reverse geocoding service abstraction
- [ ] OpenStreetMap Nominatim implementation
- [ ] PostGIS point storage
- [ ] Location source tracking (exif/browser/manual)
- [ ] Fallback chain: EXIF -> browser -> manual

### Phase 10: Jurisdiction & Routing
- [ ] Jurisdiction service (lat/lng -> authority/ward/departments)
- [ ] Department routing engine (category + location -> department)
- [ ] Configurable routing rules
- [ ] SLA engine (configurable per category/authority)
- [ ] Authority registry

### Phase 11: Government Integration
- [ ] GovernmentIntegration interface
- [ ] MockMunicipalityIntegration
- [ ] EmailIntegration architecture
- [ ] PortalLinkIntegration
- [ ] Background submission via BullMQ
- [ ] Retry with exponential backoff
- [ ] Failure handling & manual fallback
- [ ] Platform status vs External status separation

### Phase 12: Admin Portal
- [ ] Admin layout & navigation
- [ ] Dashboard (metrics, charts, map)
- [ ] Complaint queue (table, filters, search)
- [ ] Complaint detail (photos, map, AI analysis, timeline, actions)
- [ ] Status management (Accept, Assign, Start Work, Resolve, Reject, etc.)
- [ ] Officer assignment
- [ ] Admin notes
- [ ] Role-based views

### Phase 13: Tracking & Notifications
- [ ] Citizen "My Complaints" page
- [ ] Complaint detail page with status timeline
- [ ] Resolution verification (citizen confirms resolution)
- [ ] Reopen/escalation workflow
- [ ] Notification abstraction
- [ ] Email notification implementation
- [ ] Notification events (submitted, received, assigned, status change, resolved)

### Phase 14: Analytics
- [ ] Citizen analytics (my complaints summary)
- [ ] Admin analytics dashboard
- [ ] Complaints by category/ward/department charts
- [ ] Resolution time metrics
- [ ] SLA violation tracking
- [ ] Hotspot detection (recurring problem areas)

### Phase 15: Security & Privacy
- [ ] Input validation on all endpoints
- [ ] Rate limiting (IP + account-based)
- [ ] CSRF protection
- [ ] Audit logging for admin actions
- [ ] Privacy: strip EXIF from public images
- [ ] Privacy: never expose phone/email publicly
- [ ] Anti-spam: duplicate detection (perceptual hash + proximity + time)
- [ ] Image hashing for duplicate detection

### Phase 16: Public Features
- [ ] Public issue map (/map) with clustering
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] "How it works" section
- [ ] Government disclaimer

### Phase 17: Testing
- [ ] Unit tests (services, routing engine, classification)
- [ ] Integration tests (API endpoints, database)
- [ ] E2E acceptance test (full citizen flow)
- [ ] Auth & RBAC tests
- [ ] Government integration mock tests

### Phase 18: Deployment
- [ ] Production Docker builds
- [ ] CI/CD pipeline
- [ ] Environment configuration guide
- [ ] Production checklist

## Key Decisions

1. **NestJS over Express**: Provides module system, dependency injection, guards, interceptors out of the box - essential for a complex multi-role platform.
2. **Prisma over Drizzle**: Better migration tooling, Prisma Studio for debugging, wider ecosystem.
3. **Leaflet/OSM for MVP maps**: No API key required, free, sufficient for MVP. Provider abstraction allows switching to Google Maps/Mapbox later.
4. **Turborepo monorepo**: Shared types between frontend and backend, shared UI components between citizen and admin portals.
5. **Separate Next.js apps for citizen/admin**: Different security contexts, deployment patterns, and user experiences.
