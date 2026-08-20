# CivicConnect India - API Documentation

## Base URL
```
Development: http://localhost:4000/api
```

## Authentication
All protected endpoints require: `Authorization: Bearer <token>`

## Standard Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

## Standard Pagination
```
GET /api/resource?page=1&limit=20&sort=created_at&order=desc
```
Response includes:
```json
{
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## Auth Endpoints

### POST /api/auth/register
Register a new citizen account.
```json
Request:
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "securePassword123"
}

Response (201):
{
  "id": "uuid",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "emailVerified": false
}
```

### POST /api/auth/login
```json
Request:
{
  "email": "rahul@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "user": {
    "id": "uuid",
    "name": "Rahul Sharma",
    "email": "rahul@example.com"
  }
}
```

### POST /api/auth/refresh
```json
Request:
{
  "refreshToken": "jwt..."
}

Response (200):
{
  "accessToken": "jwt...",
  "refreshToken": "jwt..."
}
```

### POST /api/auth/logout
Auth required.
```
Response (200): { "message": "Logged out" }
```

### POST /api/auth/send-otp
```json
Request:
{
  "email": "rahul@example.com",
  "type": "EMAIL_VERIFY"
}

Response (200):
{ "message": "OTP sent" }
```

### POST /api/auth/verify-otp
```json
Request:
{
  "email": "rahul@example.com",
  "code": "123456",
  "type": "EMAIL_VERIFY"
}

Response (200):
{ "verified": true }
```

---

## Categories

### GET /api/categories
Public endpoint. Returns all active categories with subcategories.
```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "name": "Waste Management",
      "slug": "waste_management",
      "icon": "trash",
      "subcategories": [
        {
          "id": "uuid",
          "name": "Garbage Accumulation",
          "slug": "garbage_accumulation"
        }
      ]
    }
  ]
}
```

---

## Complaints (Citizen)

### POST /api/complaints
Auth required. Create a new complaint (draft).
```json
Request:
{
  "title": "Garbage accumulation near bus stop",
  "description": "Large pile of garbage...",
  "categoryId": "uuid",
  "subcategoryId": "uuid",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "address": "Near Shivaji Nagar Bus Stop",
  "locationSource": "browser",
  "reportedAt": "2026-08-16T15:05:00Z"
}

Response (201):
{
  "id": "uuid",
  "publicId": "CIV-2026-000184",
  "status": "DRAFT",
  "title": "Garbage accumulation near bus stop",
  "createdAt": "2026-08-16T15:05:30Z"
}
```

### POST /api/complaints/:id/images
Auth required. Upload images for a complaint. Multipart form data.
```
Content-Type: multipart/form-data
Field: images (max 5 files, each < 10MB, JPG/PNG/WEBP)

Response (201):
{
  "images": [
    {
      "id": "uuid",
      "storageKey": "complaints/uuid/img-001.jpg",
      "thumbnailKey": "complaints/uuid/thumb-001.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 2048000,
      "width": 4032,
      "height": 3024,
      "exifLatitude": 18.5204,
      "exifLongitude": 73.8567,
      "exifTimestamp": "2026-08-16T15:00:00Z"
    }
  ]
}
```

### POST /api/complaints/:id/analyze
Auth required. Trigger AI analysis on complaint images.
```json
Response (200):
{
  "analysis": {
    "category": "waste_management",
    "subcategory": "garbage_accumulation",
    "confidence": 0.94,
    "severity": "medium",
    "evidence": [
      "large amount of loose waste",
      "waste located on roadside"
    ],
    "explanation": "The image shows a significant accumulation of household waste near a road.",
    "generatedTitle": "Garbage accumulation reported near Shivaji Nagar",
    "generatedDescription": "On 16 August 2026 at approximately 3:05 PM, a significant accumulation of household waste was observed near Shivaji Nagar Bus Stop..."
  },
  "suggestedCategory": { "id": "uuid", "name": "Waste Management" },
  "suggestedSubcategory": { "id": "uuid", "name": "Garbage Accumulation" },
  "jurisdiction": {
    "authority": { "id": "uuid", "name": "Pune Municipal Corporation" },
    "department": { "id": "uuid", "name": "Solid Waste Management" },
    "ward": "Ward 15"
  }
}
```

### PATCH /api/complaints/:id
Auth required. Update complaint (before submission).
```json
Request:
{
  "title": "Updated title",
  "description": "Updated description",
  "categoryId": "uuid",
  "subcategoryId": "uuid"
}

Response (200):
{ "id": "uuid", "publicId": "CIV-2026-000184", "status": "READY_TO_SUBMIT" }
```

### POST /api/complaints/:id/submit
Auth required. Submit the complaint for routing.
```json
Response (200):
{
  "id": "uuid",
  "publicId": "CIV-2026-000184",
  "status": "SUBMITTED",
  "department": { "name": "Solid Waste Management" },
  "authority": { "name": "Demo Municipal Corporation" },
  "expectedResolutionAt": "2026-08-18T15:05:00Z"
}
```

### GET /api/complaints
Auth required. List user's complaints.
```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "publicId": "CIV-2026-000184",
      "title": "Garbage accumulation...",
      "status": "IN_PROGRESS",
      "category": { "name": "Waste Management" },
      "primaryImage": { "thumbnailUrl": "https://..." },
      "address": "Near Shivaji Nagar Bus Stop",
      "createdAt": "2026-08-16T15:05:30Z"
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### GET /api/complaints/:id
Auth required. Get complaint details.
```json
Response (200):
{
  "id": "uuid",
  "publicId": "CIV-2026-000184",
  "title": "Garbage accumulation near bus stop",
  "description": "...",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  "category": { "id": "uuid", "name": "Waste Management" },
  "subcategory": { "id": "uuid", "name": "Garbage Accumulation" },
  "authority": { "id": "uuid", "name": "Demo Municipal Corporation" },
  "department": { "id": "uuid", "name": "Solid Waste Management" },
  "images": [...],
  "latitude": 18.5204,
  "longitude": 73.8567,
  "address": "Near Shivaji Nagar Bus Stop",
  "externalReference": "MUN-928372",
  "externalStatus": "RECEIVED",
  "reportedAt": "2026-08-16T15:05:00Z",
  "submittedAt": "2026-08-16T15:10:00Z",
  "expectedResolutionAt": "2026-08-18T15:10:00Z",
  "resolvedAt": null,
  "statusHistory": [
    {
      "oldStatus": null,
      "newStatus": "DRAFT",
      "createdAt": "2026-08-16T15:05:30Z"
    },
    {
      "oldStatus": "DRAFT",
      "newStatus": "SUBMITTED",
      "createdAt": "2026-08-16T15:10:00Z"
    }
  ]
}
```

### GET /api/complaints/:id/history
Auth required. Get full status history.

### POST /api/complaints/:id/verify-resolution
Auth required. Citizen verifies resolution.
```json
Request:
{
  "verified": false,
  "note": "Garbage is still there",
  "imageIds": ["uuid"]
}

Response (200):
{ "status": "IN_PROGRESS", "message": "Complaint reopened" }
```

### POST /api/complaints/:id/reopen
Auth required. Reopen a resolved complaint.

---

## Geolocation

### GET /api/geocode/reverse?lat=18.5204&lng=73.8567
```json
Response (200):
{
  "country": "India",
  "state": "Maharashtra",
  "district": "Pune",
  "city": "Pune",
  "ward": "Ward 15",
  "postalCode": "411005",
  "formattedAddress": "Near Shivaji Nagar, Pune, Maharashtra 411005"
}
```

### GET /api/jurisdiction?lat=18.5204&lng=73.8567
```json
Response (200):
{
  "authority": { "id": "uuid", "name": "Demo Municipal Corporation" },
  "ward": "Ward 15",
  "departments": [
    { "id": "uuid", "name": "Solid Waste Management" },
    { "id": "uuid", "name": "Roads Department" }
  ]
}
```

---

## Public

### GET /api/public/complaints
Public complaints for the map view.
```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "publicId": "CIV-2026-000184",
      "category": "Waste Management",
      "status": "IN_PROGRESS",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "createdAt": "2026-08-16T15:05:30Z"
    }
  ]
}
```

### GET /api/public/complaints/:publicId
Track complaint by public ID (no auth needed, limited info).

---

## Admin Endpoints

All admin endpoints require admin authentication and appropriate role.

### POST /api/admin/auth/login
```json
Request:
{ "email": "admin@example.com", "password": "adminPassword" }

Response (200):
{
  "accessToken": "jwt...",
  "admin": { "id": "uuid", "name": "Admin", "role": "DEPARTMENT_ADMIN" }
}
```

### GET /api/admin/dashboard
Role: OFFICER+
```json
Response (200):
{
  "total": 1250,
  "new": 45,
  "pending": 120,
  "inProgress": 300,
  "resolved": 750,
  "overdue": 35,
  "highPriority": 12,
  "today": 8
}
```

### GET /api/admin/complaints
Role: OFFICER+. Supports filters: status, category, priority, ward, department, assignedOfficer, dateFrom, dateTo, search.
```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "publicId": "CIV-2026-000184",
      "title": "...",
      "category": { "name": "Waste Management" },
      "priority": "MEDIUM",
      "status": "SUBMITTED",
      "address": "...",
      "assignedOfficer": null,
      "slaDeadline": "2026-08-18T15:10:00Z",
      "isOverdue": false,
      "createdAt": "..."
    }
  ],
  "meta": { "total": 45, "page": 1, "limit": 20, "totalPages": 3 }
}
```

### GET /api/admin/complaints/:id
Role: OFFICER+. Full complaint detail with admin fields.

### PATCH /api/admin/complaints/:id/status
Role: OFFICER+.
```json
Request:
{ "status": "IN_PROGRESS", "reason": "Sanitation team dispatched" }

Response (200):
{ "status": "IN_PROGRESS" }
```

### POST /api/admin/complaints/:id/assign
Role: DEPARTMENT_ADMIN+.
```json
Request:
{ "officerId": "uuid" }

Response (200):
{ "assignedOfficer": { "id": "uuid", "name": "Officer Name" } }
```

### POST /api/admin/complaints/:id/notes
Role: OFFICER+.
```json
Request:
{ "note": "Inspected site. Team will arrive tomorrow." }

Response (201):
{ "id": "uuid", "note": "...", "createdAt": "..." }
```

### GET /api/admin/analytics
Role: DEPARTMENT_ADMIN+.
```json
Response (200):
{
  "complaintsByCategory": [...],
  "complaintsByWard": [...],
  "complaintsByDepartment": [...],
  "resolutionTimeAvg": 36.5,
  "complaintVolume": [...],
  "slaViolations": 12
}
```

### GET /api/admin/authorities
Role: SUPER_ADMIN.

### POST /api/admin/authorities
Role: SUPER_ADMIN.

### GET /api/admin/departments
Role: AUTHORITY_ADMIN+.

### POST /api/admin/departments
Role: AUTHORITY_ADMIN+.

### GET /api/admin/officers
Role: DEPARTMENT_ADMIN+.

### GET /api/admin/audit-logs
Role: AUTHORITY_ADMIN+.
```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "admin": { "name": "Admin Name", "email": "admin@example.com" },
      "action": "STATUS_CHANGE",
      "entityType": "complaint",
      "entityId": "uuid",
      "oldValues": { "status": "IN_PROGRESS" },
      "newValues": { "status": "RESOLVED" },
      "ipAddress": "192.168.1.1",
      "createdAt": "..."
    }
  ]
}
```
