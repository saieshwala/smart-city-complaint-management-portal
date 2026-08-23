# CivicConnect India - Development Setup Guide

Follow these steps to get the project running on your local machine.

---

## Prerequisites

Install the following before starting:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18 or higher | https://nodejs.org/ |
| **Docker Desktop** | Latest | https://www.docker.com/products/docker-desktop/ |
| **Git** | Latest | https://git-scm.com/downloads |

Verify installations:
```bash
node --version    # Should show v18.x.x or higher
docker --version  # Should show Docker version 2x.x.x
git --version     # Should show git version 2.x.x
```

> **Note:** If you don't want to use Docker, see [Setup Without Docker](#setup-without-docker) at the bottom.

---

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd "Multi connected complain portal"
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies for the entire monorepo (API, citizen portal, admin portal, and shared packages).

---

## Step 3: Start Infrastructure Services

Start PostgreSQL, Redis, and MinIO using Docker:

```bash
docker compose up -d
```

This starts 3 containers:

| Service | Port | Credentials |
|---------|------|-------------|
| **PostgreSQL** (with PostGIS) | `5432` | User: `civicconnect` / Password: `civicconnect_dev` / DB: `civicconnect` |
| **Redis** | `6379` | No password |
| **MinIO** (S3 storage) | `9000` (API), `9001` (console) | User: `minioadmin` / Password: `minioadmin123` |

Verify all containers are running and healthy:
```bash
docker compose ps
```

You should see all 3 services with status `running (healthy)`.

---

## Step 4: Create Environment File

```bash
cp .env.example .env
```

The defaults work out of the box for local development. **No changes needed** unless you want to configure:

| Variable | When to Change |
|----------|----------------|
| `AI_API_KEY` | If you want real AI image classification (optional — mock provider works without it) |
| `JWT_SECRET` | Change to a random string for production |
| `JWT_REFRESH_SECRET` | Change to a different random string for production |

---

## Step 5: Run Database Migrations

This creates all database tables from the Prisma schema:

```bash
npm run db:migrate
```

When prompted for a migration name, type `init` and press **Enter**.

---

## Step 6: Seed the Database

This populates categories, subcategories, a default authority, departments, admin user, and routing rules:

```bash
npm run db:seed
```

---

## Step 7: Start Development Servers

```bash
npm run dev
```

This starts all 3 applications via Turborepo:

| Application | URL | Description |
|-------------|-----|-------------|
| **Citizen Portal** | http://localhost:3002 | Public-facing complaint reporting site |
| **Admin Portal** | http://localhost:3003 | Government admin dashboard |
| **API Server** | http://localhost:4001 | NestJS REST API |
| **Swagger API Docs** | http://localhost:4001/api/docs | Interactive API documentation |
| **MinIO Console** | http://localhost:9001 | File storage dashboard |
| **Prisma Studio** | Run `npm run db:studio` | Visual database browser (port 5555) |

---

## Verify Everything Works

1. Open http://localhost:3002 — you should see the CivicConnect homepage
2. Click **Register** — create a citizen account
3. Click **Report Issue** — try the AI-powered complaint wizard
4. Click **Track** — enter a complaint ID to track status
5. Open http://localhost:3003 — admin portal login page
6. Open http://localhost:4001/api/docs — Swagger API documentation

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps for production |
| `npm run db:migrate` | Run pending database migrations |
| `npm run db:seed` | Seed the database with initial data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `docker compose up -d` | Start Docker services |
| `docker compose down` | Stop Docker services |
| `docker compose down -v` | Stop Docker services **and delete all data** |
| `docker compose ps` | Check status of Docker services |
| `docker compose logs -f postgres` | View PostgreSQL logs |

---

## Project Structure

```
├── apps/
│   ├── api/              # NestJS backend (port 4001)
│   │   ├── prisma/       # Database schema & migrations
│   │   └── src/modules/  # Auth, Complaints, Admin, AI, etc.
│   ├── web/              # Citizen portal - Next.js (port 3002)
│   │   └── src/
│   │       ├── app/      # Pages (homepage, report, track, map, etc.)
│   │       └── components/
│   └── admin/            # Admin portal - Next.js (port 3003)
│       └── src/
│           ├── app/dashboard/  # Dashboard, complaints, analytics, etc.
│           └── components/
├── packages/
│   ├── types/            # Shared TypeScript types & enums
│   ├── config/           # Shared configuration
│   ├── utils/            # Shared utilities
│   └── ui/               # Shared UI components
├── docker-compose.yml    # PostgreSQL, Redis, MinIO
├── turbo.json            # Turborepo config
└── package.json          # Root workspace config
```

---

## Troubleshooting

### Port conflicts
If any port is already in use:
```bash
# Check what's using a port (e.g., 3002)
npx kill-port 3002

# Or change ports in .env and respective package.json files
```

### Docker issues
```bash
# Check if Docker Desktop is running
docker info

# Rebuild containers from scratch
docker compose down -v
docker compose up -d
```

### Database issues
```bash
# Reset the database completely
npm run db:migrate -- --reset

# Re-seed after reset
npm run db:seed

# View database in browser
npm run db:studio
```

### npm install fails
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Setup Without Docker

If you can't use Docker, install these services locally:

### PostgreSQL (v15+)

1. Download and install from https://www.postgresql.org/downloads/
2. During installation, remember the password you set for the `postgres` user
3. Open a terminal and create the database:

```bash
# Connect to PostgreSQL (replace YOUR_PASSWORD)
psql -U postgres -h localhost

# Run these SQL commands:
CREATE USER civicconnect WITH PASSWORD 'civicconnect_dev';
CREATE DATABASE civicconnect OWNER civicconnect;
GRANT ALL PRIVILEGES ON DATABASE civicconnect TO civicconnect;
\c civicconnect
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

> **PostGIS extension:** If `CREATE EXTENSION postgis` fails, download PostGIS from https://postgis.net/install/ for your PostgreSQL version.

### Redis

- **Windows:** Download from https://github.com/microsoftarchive/redis/releases or use Memurai (https://www.memurai.com/)
- **macOS:** `brew install redis && brew services start redis`
- **Linux:** `sudo apt install redis-server && sudo systemctl start redis`

### MinIO (Optional - for image uploads)

- Download from https://min.io/download
- Run: `minio server ./data --console-address ":9001"`

After installing services locally, the `.env.example` defaults should work. Just run from **Step 4** onwards.

---

## Team Contact

For questions about the codebase or setup issues, reach out to the team.
