# SmartBro — Student Success Intelligence
### Track 03 — EdTech: Academic Performance & Early Warning System

SmartBro is a complete, full-stack academic performance monitoring and student success intelligence web application. It functions as a **supportive real friend for students** and a **practical decision-support tool for teachers and administrators**.

SmartBro rejects punitive surveillance, shame, and dense ERP clutter. Instead, it provides warm encouragement, explainable early warning indicators, habit-building streak journeys, grounded AI study planning, and institutional dataset ingestion (including support for the Kaggle exam benchmark).

---

## 1. Core Product Architecture & Features

### A. Student Portal ("Learning Space")
- **Friendly Academic Dashboard:** Warm greeting, overall cumulative standing, enrolled subjects summary, attendance metrics, and recent feedback.
- **Explainable Early Warning Status:** Clear badges (`On Track`, `Needs Attention`, `High Priority Support`) with transparent pedagogical rationales and concrete next-best steps.
- **Streak Journey (Signature Habit Feature):**
  - Daily study check-in with duplicate protection.
  - **No-Guilt Recovery Path:** Missing a day never wipes milestone badges; resuming study awards the **Comeback Hero** badge.
  - Dynamic interactive journey map with milestone checkpoints (Day 1, Day 3, Day 7, Day 14, Day 30).
  - Study session logger with subject, duration, and activity type (`Revise Topic`, `Solve Questions`, `Review Mistakes`, `Class Attendance`, `Assignment`).
  - Student-defined weekly goal slider (minutes/week) and calendar heatmap.
- **SmartBro Grounded AI Companion:**
  - Conversational study buddy tuned to the student's actual grades, subjects, and recent assessments.
  - Quick action chips for instant guidance ("Break down weakest subject", "Disappointed with marks", "Streak recovery", "2 practice questions").
  - **3-to-5 Day Micro Study Planner:** Generates daily prioritized study blocks based on available weekly hours.

### B. Subject Teacher Portal
- **Subject Overview Dashboard:** Overall average, attendance trends, pass percentage, and upcoming/recent assessments.
- **Student Performance Register:** Tabular roster with filter, search, sort by risk, and transparent risk flags.
- **Student Subject Profile:** Assessment history, marks vs. class average, attendance breakdown, and feedback entry.
- **Assessment Management:** Create assessments, record and validate marks with range checking, and publish results.

### C. Class Teacher Portal
- **Class Overview Dashboard:** Holistic view of the assigned grade and section.
- **Cross-Subject Comparative Analysis:** Performance matrix identifying subjects needing coordination.
- **Student Multi-Subject Drilldown:** Comprehensive review of a student across all subjects.
- **Supportive Interventions Management:** Create support plans (`ACADEMIC_PEER_TUTORING`, `REMEDIAL_SESSIONS`, `ATTENDANCE_COUNSELING`, `STUDY_SKILLS_WORKSHOP`, `COUNSELOR_MEETING`), track progress, record outcome notes, and mark completion.

### D. Administrator Portal ("Admin Intelligence")
- **System Metrics & Cohort Distribution:** Total students, teachers, classes, active streaks, and distribution across risk cohorts (`On Track`, `Needs Attention`, `High Priority Support`).
- **Academic Dataset Ingestion Engine:**
  - Ingest, inspect, and validate institutional student datasets.
  - **Kaggle Benchmark Support (`spscientist/students-performance-in-exams`):** Auto-detects schema, validates 0–100 score bounds, detects missing values, and computes descriptive statistics (Math, Reading, Writing averages, test preparation course completion ratio).
  - **1-Click Sample Ingestion Button:** Examiners can preview and test dataset ingestion with one click without needing an external CSV file.
  - **Cross-Sectional Disclaimer:** Explicitly notes that cross-sectional exam datasets illustrate distributions rather than longitudinal decline.
- **User & Role Management:** Registry of authenticated users with role badges and one-click active/suspended toggles.
- **Configurable Risk Thresholds:** Adjust low performance floor (passing grade), attendance concern threshold, and consecutive decline percentage with live instant recalculation.
- **Master CSV Exports:** One-click downloads for Student Master Records and Interventions & Outcomes.

---

## 2. Technology Stack

- **Frontend:**
  - React 18 & TypeScript
  - Vite 5 (production bundle compiled cleanly)
  - Tailwind CSS & Custom Design System (Warm Ivory `#FAF9F6`, Deep Navy `#0F172A`, Teal `#0D9488`, Amber `#D97706`, Soft Rose `#E11D48`)
  - Lucide Icons
  - Recharts (for assessment trends)
  - React Router 6
- **Backend:**
  - Node.js & Express
  - TypeScript (strict type checking, 0 errors)
  - Prisma ORM (21 relational models)
  - Bcrypt / Argon2 password hashing
  - JWT session authentication with role-based access control (RBAC)
- **Database:**
  - **Default Local Execution:** SQLite (`server/prisma/dev.db`) for immediate zero-config testing.
  - **Production PostgreSQL:** Full PostgreSQL schema in `server/prisma/schema.postgres.prisma`.
- **Testing:**
  - Vitest & Supertest: **31 automated tests passing (100% pass rate)**.

---

## 3. Demo Accounts & One-Click Login

The login screen includes **one-click quick-fill buttons** for each role:

| Role | Email | Password | Scope & Notes |
| :--- | :--- | :--- | :--- |
| **Student** | `student@smartbro.demo` *(or `student@eduwatch.demo`)* | `SmartBro123!` | Alex Rivera (Grade 10-A, Active 5-Day Streak, Math Support) |
| **Subject Teacher** | `subjectteacher@eduwatch.demo` | `EduWatchDemo123!` | Sarah Jenkins (Mathematics: Grade 10-A, 10-B) |
| **Class Teacher** | `classteacher@eduwatch.demo` | `EduWatchDemo123!` | David Vance (Grade 10-A Class Teacher & English) |
| **Administrator** | `admin@smartbro.demo` | `SmartBro123!` | Chief Academic Administrator (System Oversight & Dataset Ingestion) |

---

## 4. Quick Start (Windows & Cross-Platform)

### Prerequisites
- Node.js (v18+ or v20+, tested on v22)
- npm (v9+)

### Installation
From the project root directory:

```powershell
# 1. Install dependencies
npm.cmd --prefix server install
npm.cmd --prefix client install
```

### Database Synchronization & Seeding
```powershell
# 2. Push Prisma schema to local database
npm.cmd --prefix server run db:push

# 3. Seed demo dataset (accounts, marks, streak data, Kaggle metadata)
npm.cmd --prefix server run db:seed
```

### Run the Application
Open two separate terminal windows:

**Terminal 1 (Backend API Server):**
```powershell
cd "C:\Users\INCUBATION LAB\Desktop\Edtech"
npm.cmd --prefix server run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```powershell
cd "C:\Users\INCUBATION LAB\Desktop\Edtech"
npm.cmd --prefix client run dev
# Client runs on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 5. Automated Test Suite

Run the full Vitest suite (31 tests covering authentication, RBAC, early warning rules, streak journeys, grounded AI companion, and Kaggle dataset validation):

```powershell
npm.cmd --prefix server run test
```

**Test Results:**
```
 ✓ src/__tests__/smartbro.test.ts (12 tests)
 ✓ src/__tests__/eduwatch.test.ts (19 tests)
 Test Files  2 passed (2)
      Tests  31 passed (31)
```

---

## 6. Project Directory Layout

```
Edtech/
├── client/                     # Frontend Vite + React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # RiskBadge, AcademicStandingBanner, Modal
│   │   │   └── layout/         # Sidebar (with SmartBro branding), TopBar, AppLayout
│   │   ├── context/            # AuthContext (JWT, session, role guards, ADMIN support)
│   │   ├── pages/
│   │   │   ├── student/        # StudentDashboard, StreakJourney, AiCompanionPage, Subjects, Attendance
│   │   │   ├── teacher/        # TeacherDashboard, TeacherStudentRegister, StudentSubjectProfile, Assessments
│   │   │   ├── class/          # ClassDashboard, ClassStudentRegister, CrossSubjectAnalysis, Interventions
│   │   │   ├── admin/          # AdminDashboard, DatasetIngestionPage, UserManagementPage, SystemConfigPage
│   │   │   └── Login.tsx       # SmartBro unified login with 1-click demo accounts
│   │   ├── services/           # api.ts (REST client for streak, AI, admin, datasets)
│   │   └── types/              # Comprehensive TypeScript interfaces
├── server/                     # Backend Node.js + Express + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma       # Active Prisma schema (SQLite dev default)
│   │   ├── schema.postgres.prisma # PostgreSQL enterprise schema
│   │   └── seed.ts             # Comprehensive database seed script
│   │   └── dev.db              # SQLite development database
│   ├── src/
│   │   ├── routes/             # auth.ts, student.ts, streak.ts, aiCompanion.ts,
│   │   │                       # subjectTeacher.ts, classTeacher.ts, admin.ts, datasets.ts
│   │   ├── middleware/         # auth.ts (RBAC, JWT, ADMIN support), errorHandler.ts
│   │   ├── services/           # earlyWarningService.ts (explainable risk rules)
│   │   └── __tests__/          # smartbro.test.ts, eduwatch.test.ts (31 automated tests)
├── package.json
└── README.md
```
