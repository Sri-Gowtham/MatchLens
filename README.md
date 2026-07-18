# MatchLens

**An explainable job & internship matching platform for students — not just a ranked list, a ranked list you can trust.**

---

![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

---

## Demo

| | |
|---|---|
| **Live App** | [{{VERCEL_URL}}]({{https://match-lens-tan.vercel.app}}) |
| **Demo Video** | [{{DEMO_VIDEO_URL}}]({{https://drive.google.com/file/d/1Ax5NZz-9TbNZ5WaJUw-oYT3PYigVP35O/view?usp=drive_link}}) |
| **Demo Account** | `demo@matchlens.com` / `password123` |

---

## The Problem

Students applying for jobs and internships are buried under generic listings with no signal about why something was recommended to them. A filtered list sorted by "relevance" is useless when you don't know what "relevant" means — students can't act on a percentage they don't understand. The result is wasted applications, missed matches, and no clear path to improvement.

## The Idea

MatchLens makes every match transparent. Each listing shows a scored breakdown — skills matched, GPA threshold, work authorization compatibility — so students know exactly why they ranked where they did, not just that they did. The Skill Gap Insights page goes further: it aggregates gaps across all listings to tell students precisely which skills to learn next to move the needle, turning a passive job board into an active growth tool.

---

## Key Features

- **JWT authentication** — secure register/login flow with token-based session management
- **Multi-section profile** with live completion ring (Basic Info, Academic, Experience, Links & Documents)
- **Explainable match scoring** — every listing shows a visual breakdown: skills (60%), GPA (20%), work authorization (20%)
- **Dedicated filter panel** — role keyword, location, work mode (Remote/Hybrid/On-site), employment type, visa sponsorship
- **Skill Gap Insights** — aggregate analysis across all listings showing which skills appear most in gaps, with priority ranking
- **Applications tracker** — kanban-style status board tracking each application from Saved through to Offer/Rejected

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 18, TypeScript, Tailwind CSS v3 |
| **Backend** | Spring Boot 3, Java 17, Spring Security + JWT |
| **Database** | MySQL 8 |
| **Deployment** | Vercel (frontend), Railway (backend + DB) |

---

## Architecture

MatchLens follows a standard three-tier architecture: the Angular SPA communicates with a Spring Boot REST API over HTTPS, which in turn talks to a managed MySQL instance on Railway. The core of the platform is the **matching engine** — a weighted rule-based scoring service that runs server-side for every student/listing pair and returns a full breakdown alongside the score. Weights are: skills overlap 60%, GPA threshold 20%, work authorization compatibility 20%. The breakdown is stored alongside the match record and returned directly to the client, so there is no black-box percentage — every number is derived from a visible formula.

```
Angular SPA (Vercel)
      │  HTTPS / JSON REST
      ▼
Spring Boot API (Railway)
  ├── AuthController        — JWT issue & validation
  ├── StudentController     — profile CRUD
  ├── ListingController     — matching engine, scored results + per-listing breakdown
  └── ApplicationController — application lifecycle (Saved → Applied → In Review → Offer/Rejected)
      │  JPA / Hibernate
      ▼
MySQL 8 (Railway managed)
```

---

## Screenshots

<!-- screenshot: Login page — centered card, MatchLens logo, demo credentials hint -->
![Login](docs/screenshots/login.png)

<!-- screenshot: Profile page — two-column layout with sticky completion ring sidebar and all 5 section cards -->
![Profile](docs/screenshots/profile.png)

<!-- screenshot: Feed page — listing cards with score badges and expanded "Why this matched" breakdown panel open on one card -->
![Feed with breakdown](docs/screenshots/feed-breakdown.png)

<!-- screenshot: Skill Gap Insights page — aggregated skill gap list/chart, most impactful skills highlighted in amber -->
![Insights](docs/screenshots/insights.png)

<!-- screenshot: Applications tracker — kanban board with status columns (Saved, Applied, In Review, Offer, Rejected) -->
![Applications](docs/screenshots/applications.png)

> Add screenshots to `docs/screenshots/` and update the paths above before submitting.

---

## Running Locally

### Prerequisites

- Node.js 18+ and npm
- Java 17+ and Maven 3.9+
- MySQL 8 running locally (or use the Railway connection string from the dashboard)

### Frontend

```bash
cd matchlens

# Install dependencies
npm install

# Start the mock backend (json-server on port 3000)
npm run mock

# Start the Angular dev server (port 4200, opens browser automatically)
npm run dev
```

The app opens at `http://localhost:4200`. Mock login: `alex@example.com` / `password123`.

> `npm run mock` and `npm run dev` must run in separate terminals simultaneously.

### Backend

```bash
cd backend

# Provide environment variables (or edit application-local.properties directly)
export MYSQLHOST=localhost
export MYSQLPORT=3306
export MYSQLDATABASE=matchlens
export MYSQLUSER=root
export MYSQLPASSWORD=password
export JWT_SECRET=6FgTl+nlAU2SHMEtwy3H+dAPFkhJ55TSrglT/LLi8us=
export CORS_ORIGIN=http://localhost:4200

# Run with the local profile (picks up application-local.properties)
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The API starts on `http://localhost:8080/api`.  
Switch the Angular frontend to point at it by setting `apiUrl: 'http://localhost:8080/api'` in `src/environments/environment.ts`.

### Docker (backend)

```bash
cd backend
docker build -t matchlens-api .
docker run -p 8080:8080 \
  -e MYSQLHOST=host.docker.internal \
  -e MYSQLPORT=3306 \
  -e MYSQLDATABASE=matchlens \
  -e MYSQLUSER=root \
  -e MYSQLPASSWORD=password \
  -e JWT_SECRET=your-secret \
  -e CORS_ORIGIN=http://localhost:4200 \
  matchlens-api
```

---

## API Overview

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <token>`.

| Method | Path | Auth | Purpose |
|--------|------|:----:|---------|
| `POST` | `/auth/register` | — | Create a new student account; returns JWT |
| `POST` | `/auth/login` | — | Authenticate; returns JWT + student ID |
| `GET` | `/students/{id}` | ✓ | Fetch full student profile |
| `PUT` | `/students/{id}` | ✓ | Replace student profile (full update) |
| `GET` | `/listings/matched` | ✓ | Scored & ranked listings for a student with per-listing breakdown. Query params: `studentId`, `role`, `location`, `workMode`, `sponsorship`, `employmentType` |
| `GET` | `/applications` | ✓ | All applications for a student (`?studentId=`) |
| `POST` | `/applications` | ✓ | Create an application (`SAVED` or `APPLIED`) |
| `PATCH` | `/applications/{id}` | ✓ | Update application status |

**Application status lifecycle:** `SAVED` → `APPLIED` → `IN_REVIEW` → `OFFER` / `REJECTED`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|:--------:|-------------|
| `MYSQLHOST` | Yes | MySQL host |
| `MYSQLPORT` | Yes | MySQL port (typically `3306`) |
| `MYSQLDATABASE` | Yes | Database name |
| `MYSQLUSER` | Yes | Database user |
| `MYSQLPASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | Base64-encoded HMAC-SHA256 secret (min 32 bytes) |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: `http://localhost:4200`) |

---

## Team

- [{{TEAM_MEMBER_1}}]({{TEAM_MEMBER_1_GITHUB}})
- [{{TEAM_MEMBER_2}}]({{TEAM_MEMBER_2_GITHUB}})

---

*Built for **CredX Hiring Challenge 2.0** — 16-hour hackathon, solo-developed with Antigravity + Claude.*
