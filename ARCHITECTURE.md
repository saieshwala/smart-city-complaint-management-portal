# CivicConnect India - Architecture

## System Architecture

```
                    +-----------------+
                    |   CDN / Nginx   |
                    +--------+--------+
                             |
              +--------------+--------------+
              |                             |
     +--------v--------+          +--------v--------+
     |  Citizen Portal  |          |  Admin Portal   |
     |  (Next.js)       |          |  (Next.js)      |
     |  Port: 3000      |          |  Port: 3001     |
     +--------+---------+          +--------+--------+
              |                             |
              +--------------+--------------+
                             |
                    +--------v--------+
                    |   API Gateway   |
                    |   (NestJS)      |
                    |   Port: 4000    |
                    +--------+--------+
                             |
         +-------------------+-------------------+
         |         |         |         |         |
    +----v---+ +---v----+ +-v------+ +v-------+ +v---------+
    |  Auth  | |Complaint| |Image  | |Geo     | |Government|
    |Service | |Service  | |Service| |Service | |Integration|
    +--------+ +--------+ +-------+ +--------+ +----------+
         |         |         |         |         |
    +----v---------v---------v---------v---------v----+
    |              PostgreSQL + PostGIS                |
    +-------------------------------------------------+
    
    +------------------+  +------------------+  +------------------+
    |     Redis        |  |     MinIO/S3     |  |   AI Service     |
    |  (Cache/Queue)   |  |  (Image Storage) |  |  (Classification)|
    +------------------+  +------------------+  +------------------+
```

## Component Architecture

### 1. API Layer (NestJS)

```
apps/api/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/          # JWT, OTP
│   │   ├── guards/              # Auth, Roles
│   │   └── dto/
│   ├── complaints/
│   │   ├── complaints.module.ts
│   │   ├── complaints.controller.ts
│   │   ├── complaints.service.ts
│   │   ├── dto/
│   │   └── entities/
│   ├── images/
│   │   ├── images.module.ts
│   │   ├── images.service.ts
│   │   ├── image-processor.service.ts
│   │   └── metadata-extractor.service.ts
│   ├── ai/
│   │   ├── ai.module.ts
│   │   ├── ai.service.ts
│   │   ├── providers/
│   │   │   ├── ai-provider.interface.ts
│   │   │   ├── openai-vision.provider.ts
│   │   │   └── mock-ai.provider.ts
│   │   └── complaint-generator.service.ts
│   ├── geolocation/
│   │   ├── geolocation.module.ts
│   │   ├── geolocation.service.ts
│   │   ├── jurisdiction.service.ts
│   │   └── providers/
│   │       ├── geocoding-provider.interface.ts
│   │       ├── nominatim.provider.ts
│   │       └── mock-geocoding.provider.ts
│   ├── routing/
│   │   ├── routing.module.ts
│   │   ├── complaint-router.service.ts
│   │   └── sla.service.ts
│   ├── government/
│   │   ├── government.module.ts
│   │   ├── government.service.ts
│   │   ├── integrations/
│   │   │   ├── government-integration.interface.ts
│   │   │   ├── mock-municipality.integration.ts
│   │   │   ├── email.integration.ts
│   │   │   └── portal-link.integration.ts
│   │   └── submission.processor.ts
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   └── providers/
│   │       ├── notification-provider.interface.ts
│   │       ├── email-notification.provider.ts
│   │       └── mock-notification.provider.ts
│   ├── admin/
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── analytics.service.ts
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   └── categories.service.ts
│   └── common/
│       ├── prisma/
│       │   ├── prisma.module.ts
│       │   └── prisma.service.ts
│       ├── redis/
│       │   └── redis.module.ts
│       ├── storage/
│       │   ├── storage.module.ts
│       │   ├── storage.service.ts
│       │   └── storage-provider.interface.ts
│       ├── queue/
│       │   └── queue.module.ts
│       ├── interceptors/
│       │   ├── logging.interceptor.ts
│       │   └── transform.interceptor.ts
│       ├── filters/
│       │   └── http-exception.filter.ts
│       ├── guards/
│       │   ├── auth.guard.ts
│       │   └── roles.guard.ts
│       ├── decorators/
│       │   ├── roles.decorator.ts
│       │   └── current-user.decorator.ts
│       └── dto/
│           └── pagination.dto.ts
```

### 2. Frontend Architecture (Next.js App Router)

```
apps/web/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Homepage
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── report/
│   │   └── page.tsx                # Multi-step wizard
│   ├── complaints/
│   │   ├── page.tsx                # My Complaints
│   │   └── [id]/page.tsx           # Complaint Detail
│   ├── map/
│   │   └── page.tsx                # Public Issue Map
│   ├── track/
│   │   └── page.tsx                # Track by ID
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   └── api/                        # Next.js API routes (BFF)
├── components/
│   ├── layout/
│   ├── report/                     # Wizard steps
│   ├── complaints/
│   ├── map/
│   └── common/
├── lib/
│   ├── api-client.ts
│   ├── auth.ts
│   └── utils.ts
├── hooks/
├── i18n/
│   ├── en.json
│   ├── hi.json
│   └── mr.json
└── types/
```

### 3. Key Abstractions

#### Image Classifier Interface
```typescript
interface ImageClassifier {
  analyzeImage(image: Buffer): Promise<{
    category: string;
    subcategory: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence: string[];
    explanation: string;
  }>;
}
```

#### Government Integration Interface
```typescript
interface GovernmentIntegration {
  submitComplaint(complaint: ComplaintSubmission): Promise<SubmissionResult>;
  getComplaintStatus(externalRef: string): Promise<ExternalStatus | null>;
  getDepartments(): Promise<Department[]>;
}
```

#### Geocoding Provider Interface
```typescript
interface GeocodingProvider {
  reverseGeocode(lat: number, lng: number): Promise<{
    country: string;
    state: string;
    district: string;
    city: string;
    ward: string;
    postalCode: string;
    formattedAddress: string;
  }>;
}
```

#### Notification Provider Interface
```typescript
interface NotificationProvider {
  send(notification: Notification): Promise<void>;
}
```

### 4. Data Flow: Complaint Submission

```
1. Citizen uploads image
   → Client-side compression
   → Upload to API
   → Server validates (MIME, magic bytes, size, dimensions)
   → Store in S3/MinIO
   → Extract EXIF metadata
   → Strip EXIF from public copy

2. Location determination
   → Check EXIF GPS → Browser geolocation → Manual selection
   → Store as PostGIS POINT
   → Reverse geocode → Get address components
   → Determine jurisdiction → Get authority & departments

3. AI Classification
   → Send image to AI provider
   → Receive: category, subcategory, confidence, severity
   → Generate complaint text
   → Present to user for confirmation

4. Complaint Creation
   → User confirms/edits category & description
   → Create complaint record (status: READY_TO_SUBMIT)
   → User clicks Submit
   → Create background job (BullMQ)
   → Return complaint ID immediately

5. Background Submission
   → Worker picks up job
   → Determine integration type for authority
   → Call integration adapter
   → On success: store external reference, update status
   → On failure: retry with exponential backoff
   → After max retries: FAILED_SUBMISSION, notify admin

6. Status Updates
   → Admin updates status via admin portal
   → Status history recorded
   → Citizen notified
   → Audit log created
```

### 5. Security Architecture

- **Authentication**: JWT (access + refresh tokens), Email OTP
- **Authorization**: RBAC with guards on every endpoint
- **Input Validation**: class-validator on all DTOs, server-side
- **File Security**: MIME + magic byte validation, size limits, filename sanitization
- **SQL Injection**: Prisma parameterized queries
- **XSS**: React auto-escaping, Content-Security-Policy headers
- **Rate Limiting**: @nestjs/throttler (IP + user-based)
- **CSRF**: SameSite cookies, CSRF tokens where needed
- **Audit**: Immutable audit log for all admin actions
- **Privacy**: EXIF stripping, no public PII exposure, signed URLs

### 6. Queue Architecture (BullMQ)

| Queue | Purpose |
|-------|---------|
| `image-processing` | Validate, compress, extract metadata, generate thumbnails |
| `ai-analysis` | Send image to AI, store classification results |
| `geocoding` | Reverse geocode coordinates |
| `complaint-submission` | Submit to government integration |
| `notifications` | Send email/SMS notifications |
| `duplicate-detection` | Check for duplicate complaints |
| `analytics` | Process analytics aggregations |
| `escalation` | Check SLA violations, trigger escalations |

### 7. Deployment Architecture

```
Docker Compose (Development):
├── postgres (PostgreSQL 16 + PostGIS)
├── redis (Redis 7)
├── minio (MinIO - S3-compatible storage)
├── api (NestJS backend)
├── web (Next.js citizen portal)
├── admin (Next.js admin portal)
└── worker (BullMQ workers)
```
