# Research: Clinic Management System

**Date**: 2026-05-26 | **Status**: Complete

## Decision Log

### 1. Authentication Strategy

**Decision**: NextAuth.js v5 with Credentials provider (phone number + password)

**Rationale**: Spec requires phone+password auth for all roles. NextAuth.js provides session management, CSRF protection, and JWT/session handling out of the box. Credentials provider allows custom phone+password validation against Prisma. Password hashing via bcrypt.

**Alternatives considered**:
- Clerk/Auth0: Adds external dependency, cost at scale, less control over phone-based flow
- Custom JWT: More work, more security surface area to maintain
- Supabase Auth: Ties to Supabase ecosystem, phone auth is SMS-OTP focused not password-based

### 2. Multi-Tenancy Approach

**Decision**: Row-level isolation with `clinicId` foreign keys on tenant-scoped data. No schema-per-tenant.

**Rationale**: Spec targets 100 clinics — row-level isolation with indexed queries is sufficient. Junction tables (`ClinicDoctor`, `ClinicPatient`) handle many-to-many relationships. All queries include `clinicId` in WHERE clauses for data isolation. Prisma middleware can enforce this automatically.

**Alternatives considered**:
- Schema-per-tenant: Overkill for 100 clinics, complicates migrations
- Database-per-tenant: Same issue, plus connection pooling complexity
- RLS (Postgres Row Level Security): Good option but adds Postgres-specific complexity; may adopt in v2

### 3. Phone Number Lookup & Deduplication

**Decision**: Normalized phone storage (E.164 format), unique index per entity type, real-time search on input

**Rationale**: Spec explicitly requires phone-based deduplication for doctors and patients. E.164 normalization (e.g., `+964XXXXXXXXX`) prevents format variations from creating duplicates. Unique constraint on `Doctor.phone` and `Patient.phone`. Search triggers on 7+ digit input with debounced API call.

**Alternatives considered**:
- Fuzzy phone matching: Unnecessary with E.164 normalization
- Composite key (phone + country): v1 is single-region, simple unique on phone suffices
- Deferred deduplication (batch): Spec requires real-time lookup at creation time

### 4. File Upload Strategy

**Decision**: Uploadthing for file uploads (S3-compatible under the hood)

**Rationale**: 20MB max per file, common formats (PDF, JPG, PNG). Uploadthing provides signed uploads, type validation, and integrates well with Next.js. Files associated to medical records via `FileAttachment` model with `recordId` foreign key.

**Alternatives considered**:
- Direct S3: More setup, need signed URL generation, CORS config
- Vercel Blob: Simpler but less control over storage location
- Local filesystem: Not scalable, doesn't work on serverless

### 5. SMS/Notification Service

**Decision**: Twilio for SMS delivery (invitations, appointment notifications)

**Rationale**: Spec requires SMS for doctor invitations and appointment reminders. Twilio is industry standard, reliable delivery, good Node.js SDK. Abstract behind `NotificationService` interface for future provider swaps.

**Alternatives considered**:
- SendGrid: Better for email, SMS is secondary
- AWS SNS: Lower cost but more setup, less developer-friendly
- In-app only: Spec explicitly requires SMS notifications

### 6. UI Component Strategy

**Decision**: shadcn/ui + Tailwind CSS 4, card-based dashboard layout

**Rationale**: Spec demands "super duper user-friendly" UI. shadcn/ui provides accessible, composable components (dialogs, data tables, forms, toasts) that satisfy WCAG 2.1 AA. Tailwind CSS provides consistent design tokens. Card-based layout for dashboards enables clear information hierarchy.

**Alternatives considered**:
- Material UI: Heavier bundle, opinionated design system
- Chakra UI: Good accessibility but larger runtime
- Custom components: Too much effort for v1, risk of inconsistency

### 7. State Management

**Decision**: React Server Components + Server Actions for data fetching; minimal client state via React hooks

**Rationale**: Next.js App Router with RSC handles most data fetching server-side. Forms use React Hook Form + Zod for validation. No global state library needed — user session from NextAuth, page data from RSC, form state from RHF.

**Alternatives considered**:
- Redux/Zustand: Unnecessary overhead for this app's complexity
- TanStack Query: Good for client-heavy apps, but RSC handles most fetch patterns
- SWR: Same reasoning as TanStack Query

### 8. Database Query Performance

**Decision**: Composite indexes on phone lookup columns, `clinicId` on all tenant-scoped tables, Prisma query optimization

**Rationale**: Constitution requires API p95 < 200ms. Phone lookups are the hottest path — indexed `UNIQUE` on `Doctor.phone` and `Patient.phone`. All multi-tenant queries use `clinicId` index. Prisma's `select` (not `include`) to fetch only needed fields.

**Alternatives considered**:
- Full-text search (pg_trgm): Overkill for exact phone match
- Redis cache layer: Premature for v1 scale (500 doctors, 50k patients)
- Materialized views: Unnecessary complexity for this query pattern

### 9. Appointment Scheduling Model

**Decision**: Time-slot based scheduling with `DoctorSchedule` (availability) and `Appointment` (bookings)

**Rationale**: Spec requires showing available slots per doctor per clinic. `DoctorSchedule` defines recurring weekly availability (day, start_time, end_time) per clinic. `Appointment` books against a specific date/time. Conflict detection via database constraint (unique on doctor+clinic+date+time).

**Alternatives considered**:
- Calendar integration (Google Calendar): External dependency, sync complexity
- Free-form scheduling: No conflict detection, poor UX
- Duration-based blocks: More complex than needed for v1
