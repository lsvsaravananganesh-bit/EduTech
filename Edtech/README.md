# EduWatch – Student Success Intelligence
### Academic Early Warning and Student Performance Monitoring System

EduWatch is a full-stack academic performance monitoring and early warning system designed for educational institutions. It provides explainable, data-driven academic analytics tailored specifically to three distinct institutional roles: **Students**, **Subject Teachers**, and **Class Teachers**.

---

## 1. Key Capabilities & Architecture

- **Strict Three-Role Access Control (RBAC):**
  - **Student:** View personal academic standing ("How am I progressing?"), marks, calculated percentages, assessment history, session attendance, shared teacher feedback, and active improvement action items.
  - **Subject Teacher:** Restricted strictly to assigned subjects and classes. Monitor class student registers, inspect individual student subject profiles, create assessments, enter marks with range validation, author feedback, and assign improvement plans.
  - **Class Teacher:** Holistic overview of assigned class cohort ("Which students need coordinated support?"). Cross-subject comparative analysis matrix, student multi-subject profiles, and end-to-end academic intervention tracking with follow-up notes.
- **Explainable Rule-Based Early Warning System:**
  - Evaluates student performance using configurable, transparent pedagogical rules (e.g., scores below 40%, attendance below 75%, and consecutive declines $\ge 10\%$).
  - Every risk status (`LOW_CONCERN`, `NEEDS_ATTENTION`, `HIGH_CONCERN`) is accompanied by explicit condition triggers, recorded numerical evidence, and suggested next actions.
  - Automatically recalculates standing when assessment marks or attendance records are updated.
- **Classic, Restrained Design:**
  - Built with a warm ivory background, deep navy typography, muted teal accents, and clean tabular layouts.
  - Focused visual hierarchy prioritizing actionable insights over decorative clutter.

---

## 2. Technology Stack

- **Frontend:**
  - React 18 & TypeScript
  - Vite 5
  - Tailwind CSS
  - Lucide Icons
  - Recharts (for assessment trends)
  - React Router 6
- **Backend:**
  - Node.js & Express
  - TypeScript
  - Prisma ORM (21 relational models)
  - Argon2/Bcrypt password hashing
  - JWT session management with HttpOnly cookie support
  - Role- and assignment-based authorization middleware
- **Database:**
  - Relational Database (Prisma ORM):
    - **Active Local Development Default:** SQLite (`server/prisma/schema.prisma` -> `dev.db`) for immediate zero-config execution.
    - **PostgreSQL Production Configuration:** Complete PostgreSQL schema provided in `server/prisma/schema.postgres.prisma` and `.env.example`.
- **Testing:**
  - Vitest & Supertest for unit, security, and API workflow testing.

---

## 3. Demo Credentials

The database is pre-seeded with realistic demo accounts (password for all seeded accounts: `EduWatchDemo123!`):

| Role | Email | Password | Assigned Scope |
| :--- | :--- | :--- | :--- |
| **Student** | `student@eduwatch.demo` | `EduWatchDemo123!` | Alex Rivera (Grade 10-A) |
| **Subject Teacher** | `subjectteacher@eduwatch.demo` | `EduWatchDemo123!` | Sarah Jenkins (Mathematics: 10-A, 10-B) |
| **Class Teacher** | `classteacher@eduwatch.demo` | `EduWatchDemo123!` | David Vance (Grade 10-A Class Teacher & English) |
| **Student (Peer)** | `student2@eduwatch.demo` | `EduWatchDemo123!` | Maya Lin (Grade 10-A, High Achiever) |
| **Subject Teacher** | `teacher.science@eduwatch.demo` | `EduWatchDemo123!` | Dr. Elena Rostova (Physical Science) |
| **Class Teacher** | `classteacher.10b@eduwatch.demo` | `EduWatchDemo123!` | Arthur Pendelton (Grade 10-B Class Teacher) |

*The login screen includes one-click quick-fill buttons to test each role immediately.*

---

## 4. Quick Start (Local Development)

### Prerequisites
- Node.js (v18+ or v20+, tested on v22)
- npm (v9+)

### Installation
From the project root directory:

```bash
# 1. Install dependencies for both server and client
npm.cmd --prefix server install
npm.cmd --prefix client install
```

### Database Synchronization & Seeding
```bash
# 2. Push Prisma schema to local database
npm.cmd --prefix server run db:push

# 3. Seed database with classes, assessments, marks, and demo accounts
npm.cmd --prefix server run db:seed
```

### Run the Application
Open two terminal windows:

**Terminal 1 (Backend API Server):**
```bash
npm.cmd --prefix server run dev
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm.cmd --prefix client run dev
# Client starts at http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 5. Running the Test Suite

Run Vitest to verify all 19 automated tests covering authentication, RBAC authorization, mark boundaries, attendance calculations, and early warning risk evaluations:

```bash
npm.cmd --prefix server run test
```

---

## 6. PostgreSQL Production Deployment

To connect EduWatch to a PostgreSQL database:

1. In `server/.env`, configure your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/eduwatch?schema=public"
   ```
2. In `server/prisma/schema.prisma`, update the datasource provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   *(Or copy `server/prisma/schema.postgres.prisma` to `server/prisma/schema.prisma`)*
3. Push schema and seed PostgreSQL:
   ```bash
   npx.cmd --prefix server prisma db push
   npx.cmd --prefix server tsx prisma/seed.ts
   ```

---

## 7. Project Structure

```
Edtech/
├── client/                     # Frontend Vite + React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # RiskBadge, AcademicStandingBanner, Modal
│   │   │   └── layout/         # Sidebar, TopBar, AppLayout
│   │   ├── context/            # AuthContext (JWT, session, role guards)
│   │   ├── pages/
│   │   │   ├── student/        # Student Dashboard, Subjects, Attendance, Plans
│   │   │   ├── teacher/        # Teacher Dashboard, Register, Student Profile, Assessments
│   │   │   └── class/          # Class Dashboard, Register, Cross-Subject, Interventions
│   │   ├── services/           # api.ts (REST client)
│   │   └── types/              # TypeScript definitions
├── server/                     # Backend Node.js + Express + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma       # Active Prisma schema
│   │   ├── schema.postgres.prisma # PostgreSQL configuration
│   │   └── seed.ts             # Coherent demo dataset seed script
│   ├── src/
│   │   ├── routes/             # auth.ts, student.ts, subjectTeacher.ts, classTeacher.ts
│   │   ├── middleware/         # auth.ts (RBAC, JWT), errorHandler.ts
│   │   ├── services/           # earlyWarningService.ts (explainable risk rules)
│   │   └── __tests__/          # Vitest automated test suite (19 tests)
├── package.json                # Monorepo scripts
└── README.md                   # Project documentation
```
