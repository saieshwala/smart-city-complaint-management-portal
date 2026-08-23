# Smart City Complaint Management Portal

A full-stack multi-portal civic complaint management system designed for Indian smart cities. Citizens can report infrastructure issues (potholes, water leaks, garbage, broken streetlights, etc.) with photo evidence and GPS location, while municipal administrators can track, assign, and resolve complaints through a dedicated dashboard.

## Key Features

### Citizen Portal (Port 3002)
- **Report Complaints** — Submit civic issues with photo upload, GPS auto-detection, and AI-powered categorization
- **Track Complaints** — Real-time status tracking using a unique complaint ID (no login required)
- **My Complaints** — View all submitted complaints with status updates
- **Phone OTP Login** — Quick registration/login via mobile number OTP (no email required)
- **Email/Password Auth** — Traditional authentication option
- **Browse Without Login** — View public pages freely; login only required for submission

### Admin Dashboard (Port 3003)
- **Complaint Management** — View, filter, assign, and update complaint statuses
- **Officer Assignment** — Assign complaints to department-specific officers
- **Audit Logs** — Complete trail of all admin actions (status changes, assignments, notes)
- **Analytics** — Visual charts for complaint trends, category breakdowns, resolution rates
- **Department & Officer Management** — Organized by 7 municipal departments
- **Routing Rules** — Auto-route complaints to correct departments based on category
- **Map View** — Geographic visualization of complaint locations

### Backend API (Port 4001)
- **RESTful API** with JWT authentication
- **Role-based access control** — Super Admin, Authority Admin, Department Admin, Officer, Viewer
- **Image processing** — Upload, storage (S3/local fallback), EXIF metadata extraction
- **Geolocation** — Reverse geocoding for address resolution
- **SLA Management** — Configurable resolution timelines per category/priority
- **Audit Trail** — Every admin action logged with old/new values

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + npm workspaces |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens), bcrypt, OTP |
| Storage | S3/MinIO (with local filesystem fallback) |
| Maps | Leaflet + OpenStreetMap |
| Containerization | Docker Compose |

## Project Structure

```
├── apps/
│   ├── api/          # NestJS backend (Port 4001)
│   ├── web/          # Citizen portal - Next.js (Port 3002)
│   └── admin/        # Admin dashboard - Next.js (Port 3003)
├── packages/         # Shared packages
├── infrastructure/   # Docker & deployment configs
├── docs/             # Documentation
└── turbo.json        # Turborepo config
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or Docker)
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/saieshwala/smart-city-complaint-management-portal.git
cd smart-city-complaint-management-portal

# Install dependencies
npm install

# Start PostgreSQL (via Docker)
docker compose up -d

# Setup database
cd apps/api
cp .env.example .env    # Update DATABASE_URL if needed
npx prisma migrate dev
npx prisma db seed
cd ../..

# Start all services
npm run dev
```

### Access

| Service | URL |
|---------|-----|
| Citizen Portal | http://localhost:3002 |
| Admin Dashboard | http://localhost:3003 |
| API Server | http://localhost:4001/api |

### Demo Credentials

**Admin Login** (any of these):
| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@dev.civicconnect.in | admin123 |
| Authority Admin | authorityadmin@dev.civicconnect.in | admin123 |
| Department Admin | rajesh.kumar@dev.civicconnect.in | admin123 |
| Officer | rohit.patil@dev.civicconnect.in | admin123 |

**Citizen Login:**
- Email: citizen@dev.civicconnect.in / Password: citizen123
- Or use Phone OTP: Enter any number, OTP is `4141`

## Departments & Officers

The system comes pre-seeded with 7 departments and 21 officers:

| Department | Admin | Officers |
|-----------|-------|----------|
| Solid Waste Management | Rajesh Kumar | Manoj Kulkarni, Pooja Bhosale |
| Roads Department | Priya Singh | Rohit Patil, Kavita Joshi |
| Traffic Management | Amit Patel | Deepak Gaikwad, Nisha Thakur |
| Water Supply | Sneha Reddy | Sanjay More, Meena Shinde |
| Sewerage Department | Vikram Sharma | Arun Kale, Sunita Pawar |
| Street Lighting | Anita Deshmukh | Ganesh Mane, Rashmi Deshpande |
| Public Works | Suresh Jadhav | Prakash Sawant, Aarti Kamble |

## Complaint Workflow

```
Citizen submits complaint
        ↓
AI analyzes image & categorizes
        ↓
Auto-routed to correct department
        ↓
Admin reviews → Assigns to officer
        ↓
Officer investigates → Updates status
        ↓
Resolved → Citizen notified
```

## API Endpoints

### Public
- `POST /api/auth/register` — Register with email/password
- `POST /api/auth/login` — Login
- `POST /api/auth/phone/send-otp` — Send OTP to phone
- `POST /api/auth/phone/verify-otp` — Verify OTP & login
- `GET /api/public/complaints/:publicId` — Track complaint by ID
- `GET /api/categories` — List complaint categories

### Citizen (Authenticated)
- `POST /api/complaints` — Submit a new complaint
- `GET /api/complaints` — List my complaints
- `GET /api/complaints/:id` — Complaint details

### Admin (Authenticated)
- `GET /api/admin/complaints` — All complaints (paginated, filterable)
- `PATCH /api/admin/complaints/:id/status` — Update status
- `PATCH /api/admin/complaints/:id/assign` — Assign to officer
- `POST /api/admin/complaints/:id/notes` — Add internal note
- `GET /api/admin/audit-logs` — View audit trail
- `GET /api/admin/analytics/*` — Dashboard analytics
- `GET /api/admin/stats` — Summary statistics

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5433/civicconnect
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=civicconnect
OPENAI_API_KEY=optional-for-ai-categorization
```

## License

This project is for educational and demonstration purposes.
