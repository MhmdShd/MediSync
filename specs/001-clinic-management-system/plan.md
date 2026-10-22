# Implementation Plan: Clinic Management System

**Branch**: `001-clinic-management-system` | **Date**: 2026-05-26 | **Spec**: specs/001-clinic-management-system/spec.md

**Input**: Feature specification from `specs/001-clinic-management-system/spec.md`

## Summary

Build a multi-tenant clinic management system where clinics manage doctors and patients via phone-based lookup to prevent duplicates. Doctors and patients can belong to multiple clinics with per-clinic data isolation. Three user roles (clinic admin, doctor, patient) each get dedicated dashboards. Built as a full-stack Next.js application with PostgreSQL, Prisma ORM, and shadcn/ui components.

## Technical Context

**Language/Version**: TypeScript 5.5+ (strict mode), Node.js 20 LTS

**Primary Dependencies**:
- Next.js 15 (App Router, Server Components, API Routes)
- Prisma 6 (ORM, migrations, type-safe queries)
- NextAuth.js v5 (credentials provider, phone+password auth)
- shadcn/ui + Tailwind CSS 4 (component library, styling)
- React Hook Form + Zod (form handling, validation)
- Twilio SDK (SMS notifications, invitations)
- Uploadthing or S3-compatible (file uploads, medical records)
- date-fns (date/time handling for appointments)

**Storage**: PostgreSQL 16 (relational data, indexes on phone lookups, multi-tenant queries)

**Testing**:
- Vitest (unit tests)
- Playwright (E2E/integration tests)
- MSW (external service mocking — Twilio, file storage)

**Target Platform**: Web (responsive, 320px–2560px viewports), deployed to Vercel or similar Node.js host

**Project Type**: Web application (full-stack)

**Performance Goals**:
- API p95 < 200ms, p99 < 500ms
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Phone lookup queries < 50ms (indexed)
- JS bundle < 200KB gzipped

**Constraints**:
- WCAG 2.1 AA accessibility
- Per-clinic data isolation (doctors see only their clinics' data, patients see only their records)
- Phone number uniqueness per entity type (doctor pool, patient pool)
- File uploads max 20MB, formats: PDF, JPG, PNG
- Single country/region for v1 (consistent phone format, single timezone per clinic)

**Scale/Scope**: 100 clinics, 500 doctors, 50,000 patients, ~25 screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | PASS | TypeScript strict mode, Prisma typed queries, ESLint + Prettier enforced, shadcn/ui components are composable with single responsibility |
| II. Testing Standards | PASS | Vitest for unit (80%+ coverage), Playwright for E2E, MSW for external mocking only, contract tests for API routes |
| III. UX Consistency | PASS | shadcn/ui design system with Tailwind tokens, loading skeletons, accessible form inputs, responsive layouts |
| IV. Performance | PASS | Next.js SSR/RSC for fast LCP, Prisma indexed queries for phone lookups, code splitting per route, image optimization via next/image |

No violations. All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-clinic-management-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── auth-api.md
│   ├── clinic-api.md
│   ├── doctor-api.md
│   ├── patient-api.md
│   └── appointment-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/              # Protected route group
│   │   ├── clinic/               # Clinic admin views
│   │   │   ├── settings/
│   │   │   ├── doctors/
│   │   │   ├── patients/
│   │   │   └── appointments/
│   │   ├── doctor/               # Doctor views
│   │   │   ├── dashboard/
│   │   │   ├── patients/
│   │   │   └── schedule/
│   │   └── patient/              # Patient views
│   │       ├── dashboard/
│   │       ├── records/
│   │       └── appointments/
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── clinics/
│   │   ├── doctors/
│   │   ├── patients/
│   │   ├── appointments/
│   │   └── uploads/
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui primitives
│   ├── forms/                    # Form components
│   ├── layout/                   # Navigation, sidebar, header
│   └── shared/                   # Phone lookup, data tables, stats cards
├── lib/                          # Core utilities
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma client singleton
│   ├── validations/              # Zod schemas
│   ├── services/                 # Business logic layer
│   │   ├── clinic.service.ts
│   │   ├── doctor.service.ts
│   │   ├── patient.service.ts
│   │   ├── appointment.service.ts
│   │   └── notification.service.ts
│   └── utils/                    # Helpers (phone formatting, date utils)
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── types/                        # Shared TypeScript types
│   └── index.ts
└── middleware.ts                  # Auth middleware (route protection)

tests/
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   └── api/
├── e2e/
│   ├── auth.spec.ts
│   ├── clinic-setup.spec.ts
│   ├── doctor-management.spec.ts
│   ├── patient-management.spec.ts
│   └── appointments.spec.ts
└── contract/
    ├── auth-api.test.ts
    ├── clinic-api.test.ts
    ├── doctor-api.test.ts
    ├── patient-api.test.ts
    └── appointment-api.test.ts
```

**Structure Decision**: Single Next.js project (Option 2 variant — unified full-stack). Next.js App Router collocates frontend pages and API routes in one codebase. Business logic lives in `lib/services/` to keep API routes thin. Prisma handles database access with typed queries. This avoids the overhead of separate frontend/backend deploys while maintaining clean separation of concerns.

## Complexity Tracking

No violations to justify. All gates pass cleanly.
