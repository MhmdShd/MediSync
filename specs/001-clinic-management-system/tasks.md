# Tasks: Clinic Management System

**Input**: Design documents from `specs/001-clinic-management-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Constitution mandates testing (Section II). Test tasks included per user story.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, base configuration

- [ ] T001 Initialize Next.js 15 project with TypeScript, Tailwind CSS 4, and pnpm in project root
- [ ] T002 Install and configure core dependencies: Prisma 6, NextAuth.js v5, shadcn/ui, React Hook Form, Zod, date-fns, bcrypt in package.json
- [ ] T003 [P] Configure ESLint strict + Prettier with zero-warning policy in .eslintrc.js and .prettierrc
- [ ] T004 [P] Configure Vitest with coverage thresholds (80% line, 95% critical paths) in vitest.config.ts
- [ ] T005 [P] Configure Playwright for E2E tests in playwright.config.ts
- [ ] T006 [P] Create environment configuration with validation in src/lib/env.ts and .env.example
- [ ] T007 Create project directory structure per plan.md (src/app, src/components, src/lib, tests/, prisma/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Define complete Prisma schema with all entities (User, Clinic, Doctor, Patient, ClinicDoctor, ClinicPatient, DoctorSchedule, Appointment, MedicalRecord, FileAttachment) and enums in prisma/schema.prisma
- [ ] T009 Generate initial Prisma migration and configure Prisma client singleton in src/lib/prisma.ts
- [ ] T010 [P] Create shared Zod validation schemas (phone E.164, password rules, pagination, date/time formats) in src/lib/validations/shared.ts
- [ ] T011 [P] Create utility functions for phone number normalization (E.164) in src/lib/utils/phone.ts
- [ ] T012 [P] Create date/time utility functions for appointment slots in src/lib/utils/date.ts
- [ ] T013 Configure NextAuth.js v5 with Credentials provider (phone+password) and session strategy in src/lib/auth.ts
- [ ] T014 Implement auth middleware for route protection with role-based access in src/middleware.ts
- [ ] T015 [P] Create base UI layout: root layout with providers, sidebar navigation, header with user menu in src/app/layout.tsx and src/components/layout/sidebar.tsx and src/components/layout/header.tsx
- [ ] T016 [P] Install and configure shadcn/ui components (Button, Card, Dialog, Input, Table, Toast, Form, Select, Badge, Avatar, Skeleton, DropdownMenu) in src/components/ui/
- [ ] T017 [P] Create shared components: PhoneLookupInput in src/components/shared/phone-lookup-input.tsx, DataTable in src/components/shared/data-table.tsx, StatsCard in src/components/shared/stats-card.tsx
- [ ] T018 [P] Create reusable form components: FormField wrapper, PhoneInput, PasswordInput in src/components/forms/
- [ ] T019 Implement database seed script with test data (2 clinics, 3 doctors, 5 patients, appointments, records) in prisma/seed.ts
- [ ] T020 [P] Create shared TypeScript types and API response helpers in src/types/index.ts and src/lib/utils/api.ts
- [ ] T021 [P] Create notification service interface with Twilio SMS implementation in src/lib/services/notification.service.ts
- [ ] T022 [P] Create file upload configuration with type/size validation in src/lib/utils/upload.ts
- [ ] T023 [P] Unit tests for phone normalization in tests/unit/utils/phone.test.ts
- [ ] T024 [P] Unit tests for date/time utilities in tests/unit/utils/date.test.ts
- [ ] T025 [P] Unit tests for shared Zod validation schemas in tests/unit/validations/shared.test.ts

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Clinic Owner Registers and Sets Up Clinic (Priority: P1) 🎯 MVP

**Goal**: Clinic owner signs up, creates clinic profile with name/address/hours/branding. Admin access granted automatically.

**Independent Test**: Register new account, complete clinic setup, verify clinic appears with all details.

### Tests for User Story 1

- [ ] T026 [P] [US1] Contract tests for auth API (register, login, me) in tests/contract/auth-api.test.ts
- [ ] T027 [P] [US1] Contract tests for clinic API (create, get, update, list) in tests/contract/clinic-api.test.ts
- [ ] T028 [P] [US1] Unit tests for clinic service in tests/unit/services/clinic.test.ts
- [ ] T029 [US1] Integration test for clinic registration flow in tests/integration/clinic-setup.test.ts

### Implementation for User Story 1

- [ ] T030 [P] [US1] Create Zod schemas for auth (register, login, reset-password) in src/lib/validations/auth.ts
- [ ] T031 [P] [US1] Create Zod schemas for clinic (create, update, operating hours) in src/lib/validations/clinic.ts
- [ ] T032 [US1] Implement auth API routes: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me in src/app/api/auth/
- [ ] T033 [US1] Implement password reset API routes: POST /api/auth/reset-password and /api/auth/reset-password/confirm in src/app/api/auth/reset-password/
- [ ] T034 [US1] Implement clinic service (create, get, update, list for owner) in src/lib/services/clinic.service.ts
- [ ] T035 [US1] Implement clinic API routes: POST /api/clinics, GET /api/clinics/:clinicId, PATCH /api/clinics/:clinicId, GET /api/clinics in src/app/api/clinics/
- [ ] T036 [US1] Implement clinic logo/cover upload endpoints: POST /api/clinics/:clinicId/logo and /cover in src/app/api/clinics/[clinicId]/
- [ ] T037 [P] [US1] Create registration page with phone+password form in src/app/(auth)/register/page.tsx
- [ ] T038 [P] [US1] Create login page with phone+password form in src/app/(auth)/login/page.tsx
- [ ] T039 [P] [US1] Create password reset page in src/app/(auth)/reset-password/page.tsx
- [ ] T040 [US1] Create clinic setup wizard (name, address, hours, contact, logo) in src/app/(dashboard)/clinic/settings/page.tsx
- [ ] T041 [US1] Create clinic dashboard home showing clinic overview stats in src/app/(dashboard)/clinic/page.tsx
- [ ] T042 [US1] E2E test for full clinic registration and setup flow in tests/e2e/clinic-setup.spec.ts

**Checkpoint**: Clinic registration and setup fully functional. Owner can register, create clinic, edit details, upload branding.

---

## Phase 4: User Story 2 — Clinic Adds a Doctor (Phone Lookup) (Priority: P1)

**Goal**: Clinic admin adds doctor via phone search. Existing doctors linked, new doctors created with SMS invitation.

**Independent Test**: Enter phone number, verify lookup results, confirm doctor appears on clinic roster.

### Tests for User Story 2

- [ ] T043 [P] [US2] Contract tests for doctor API (search, add, list, remove) in tests/contract/doctor-api.test.ts
- [ ] T044 [P] [US2] Unit tests for doctor service in tests/unit/services/doctor.test.ts
- [ ] T045 [US2] Integration test for doctor phone lookup and linking in tests/integration/doctor-management.test.ts

### Implementation for User Story 2

- [ ] T046 [P] [US2] Create Zod schemas for doctor (search, create, link) in src/lib/validations/doctor.ts
- [ ] T047 [US2] Implement doctor service (search by phone, create, link to clinic, remove from clinic) in src/lib/services/doctor.service.ts
- [ ] T048 [US2] Implement doctor search API: GET /api/clinics/:clinicId/doctors/search?phone= in src/app/api/clinics/[clinicId]/doctors/search/route.ts
- [ ] T049 [US2] Implement doctor management API: POST, GET /api/clinics/:clinicId/doctors, DELETE /api/clinics/:clinicId/doctors/:doctorId in src/app/api/clinics/[clinicId]/doctors/
- [ ] T050 [US2] Create doctor management page with phone lookup, add, and roster list in src/app/(dashboard)/clinic/doctors/page.tsx
- [ ] T051 [US2] Create add-doctor dialog with PhoneLookupInput, identity confirmation, and new doctor form in src/components/shared/add-doctor-dialog.tsx
- [ ] T052 [US2] Wire SMS invitation for newly created doctors via notification service in src/lib/services/doctor.service.ts
- [ ] T053 [US2] E2E test for doctor phone lookup, linking, and cross-clinic scenarios in tests/e2e/doctor-management.spec.ts

**Checkpoint**: Doctor management fully functional. Phone lookup finds existing, creates new, sends invitation, roster displays correctly.

---

## Phase 5: User Story 3 — Clinic Creates a Patient Profile (Phone Lookup) (Priority: P1)

**Goal**: Receptionist creates patient via phone search. Existing patients linked, new patients created. Per-clinic record isolation.

**Independent Test**: Enter patient phone, verify lookup, confirm patient on clinic patient list.

### Tests for User Story 3

- [ ] T054 [P] [US3] Contract tests for patient API (search, add, list, get, update) in tests/contract/patient-api.test.ts
- [ ] T055 [P] [US3] Unit tests for patient service in tests/unit/services/patient.test.ts
- [ ] T056 [US3] Integration test for patient phone lookup and linking in tests/integration/patient-management.test.ts

### Implementation for User Story 3

- [ ] T057 [P] [US3] Create Zod schemas for patient (search, create, update, link) in src/lib/validations/patient.ts
- [ ] T058 [US3] Implement patient service (search by phone, create, link to clinic, update profile) in src/lib/services/patient.service.ts
- [ ] T059 [US3] Implement patient search API: GET /api/clinics/:clinicId/patients/search?phone= in src/app/api/clinics/[clinicId]/patients/search/route.ts
- [ ] T060 [US3] Implement patient management API: POST, GET /api/clinics/:clinicId/patients, GET /api/clinics/:clinicId/patients/:patientId, PATCH /api/patients/:patientId in src/app/api/clinics/[clinicId]/patients/ and src/app/api/patients/
- [ ] T061 [US3] Create patient management page with phone lookup, add, and patient list with search/pagination in src/app/(dashboard)/clinic/patients/page.tsx
- [ ] T062 [US3] Create add-patient dialog with PhoneLookupInput and new patient form in src/components/shared/add-patient-dialog.tsx
- [ ] T063 [US3] Create patient detail view showing records and appointments within clinic context in src/app/(dashboard)/clinic/patients/[patientId]/page.tsx
- [ ] T064 [US3] E2E test for patient phone lookup, linking, cross-clinic isolation in tests/e2e/patient-management.spec.ts

**Checkpoint**: Patient management fully functional. Phone lookup deduplicates, per-clinic isolation verified.

---

## Phase 6: User Story 4 — Doctor Logs In and Views Dashboard (Priority: P2)

**Goal**: Doctor sees personalized dashboard with schedule, patient queue, stats across all clinics. Can switch clinics.

**Independent Test**: Log in as doctor, verify dashboard data, switch clinics, confirm filtering.

### Tests for User Story 4

- [ ] T065 [P] [US4] Contract tests for doctor dashboard API (dashboard, patients) in tests/contract/doctor-dashboard-api.test.ts
- [ ] T066 [P] [US4] Unit tests for doctor dashboard service in tests/unit/services/doctor-dashboard.test.ts

### Implementation for User Story 4

- [ ] T067 [US4] Implement doctor dashboard service (aggregate stats, today's appointments, clinic list) in src/lib/services/doctor-dashboard.service.ts
- [ ] T068 [US4] Implement doctor dashboard API: GET /api/doctors/me/dashboard, GET /api/doctors/me/patients in src/app/api/doctors/me/
- [ ] T069 [US4] Create doctor dashboard page with clinic switcher, today's schedule, stats cards in src/app/(dashboard)/doctor/dashboard/page.tsx
- [ ] T070 [P] [US4] Create clinic switcher component in src/components/shared/clinic-switcher.tsx
- [ ] T071 [US4] Create doctor patient list page filtered by clinic in src/app/(dashboard)/doctor/patients/page.tsx
- [ ] T072 [US4] Create patient file view (records from accessible clinics only) in src/app/(dashboard)/doctor/patients/[patientId]/page.tsx
- [ ] T073 [US4] E2E test for doctor login, dashboard, clinic switching in tests/e2e/doctor-dashboard.spec.ts

**Checkpoint**: Doctor dashboard functional with multi-clinic switching and per-clinic data isolation.

---

## Phase 7: User Story 5 — Patient Logs In and Views Their Records (Priority: P2)

**Goal**: Patient sees visit history, appointments, files, prescriptions across clinics. Each clinic's data clearly separated.

**Independent Test**: Log in as patient, verify records grouped by clinic, check data separation.

### Tests for User Story 5

- [ ] T074 [P] [US5] Contract tests for patient dashboard API (dashboard, records) in tests/contract/patient-dashboard-api.test.ts
- [ ] T075 [P] [US5] Unit tests for patient dashboard service in tests/unit/services/patient-dashboard.test.ts

### Implementation for User Story 5

- [ ] T076 [US5] Implement patient dashboard service (clinic list, upcoming appointments, records per clinic) in src/lib/services/patient-dashboard.service.ts
- [ ] T077 [US5] Implement patient dashboard API: GET /api/patients/me/dashboard, GET /api/patients/me/clinics/:clinicId/records in src/app/api/patients/me/
- [ ] T078 [US5] Create patient dashboard page with clinic list, upcoming appointments in src/app/(dashboard)/patient/dashboard/page.tsx
- [ ] T079 [US5] Create patient records page (per-clinic records with files) in src/app/(dashboard)/patient/records/page.tsx
- [ ] T080 [US5] Create patient profile edit page in src/app/(dashboard)/patient/profile/page.tsx
- [ ] T081 [US5] E2E test for patient login, dashboard, per-clinic record viewing in tests/e2e/patient-dashboard.spec.ts

**Checkpoint**: Patient portal functional. Records grouped by clinic, data isolation enforced.

---

## Phase 8: User Story 6 — Appointment Scheduling (Priority: P3)

**Goal**: Receptionist or patient books appointment based on doctor availability. Notifications sent on confirmation/cancellation.

**Independent Test**: Select doctor, view slots, book appointment, verify on both dashboards, cancel and verify slot freed.

### Tests for User Story 6

- [ ] T082 [P] [US6] Contract tests for appointment API (availability, book, list, update, cancel) in tests/contract/appointment-api.test.ts
- [ ] T083 [P] [US6] Unit tests for appointment service in tests/unit/services/appointment.test.ts
- [ ] T084 [P] [US6] Unit tests for medical record service in tests/unit/services/medical-record.test.ts

### Implementation for User Story 6

- [X] T085 [P] [US6] Create Zod schemas for appointments (book, update, schedule) and medical records in src/lib/validations/appointment.ts
- [X] T086 [US6] Implement appointment service (check availability, book, cancel, status transitions, conflict detection) in src/lib/services/appointment.service.ts
- [X] T087 [US6] Implement doctor schedule API: POST /api/clinics/:clinicId/doctors/:doctorId/schedule in src/app/api/clinics/[clinicId]/doctors/[doctorId]/schedule/route.ts
- [X] T088 [US6] Implement availability API: GET /api/clinics/:clinicId/doctors/:doctorId/availability in src/app/api/clinics/[clinicId]/doctors/[doctorId]/availability/route.ts
- [X] T089 [US6] Implement appointment CRUD API: POST, GET /api/clinics/:clinicId/appointments, PATCH, DELETE /api/clinics/:clinicId/appointments/:appointmentId in src/app/api/clinics/[clinicId]/appointments/
- [X] T090 [US6] Implement medical record API: POST /api/clinics/:clinicId/appointments/:appointmentId/records, POST /api/records/:recordId/files in src/app/api/
- [X] T091 [US6] Implement medical record service (create record, attach files) in src/lib/services/medical-record.service.ts
- [X] T092 [US6] Create appointment booking page with doctor select, date picker, slot grid in src/app/(dashboard)/clinic/appointments/page.tsx
- [X] T093 [US6] Create appointment booking dialog with availability calendar in src/components/shared/book-appointment-dialog.tsx
- [X] T094 [US6] Create doctor schedule management page in src/app/(dashboard)/doctor/schedule/page.tsx
- [X] T095 [US6] Create patient self-booking page in src/app/(dashboard)/patient/appointments/page.tsx
- [X] T096 [US6] Wire appointment notification SMS (confirmation, cancellation, reminder) in appointment service
- [ ] T097 [US6] E2E test for full appointment lifecycle (book, confirm, complete, cancel) in tests/e2e/appointments.spec.ts

**Checkpoint**: Appointment scheduling fully functional. Availability, booking, cancellation, notifications, medical records all working.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple stories

- [X] T098 [P] Add loading skeletons for all dashboard and list pages in src/components/shared/skeletons/
- [X] T099 [P] Add consistent error boundary and toast notifications across all pages in src/components/shared/error-boundary.tsx
- [X] T100 [P] Add responsive layout adjustments for mobile viewports (320px–768px) across all pages
- [X] T101 Implement role-based navigation — sidebar shows different menu items per role in src/components/layout/sidebar.tsx
- [X] T102 [P] Add accessibility audit: form labels, alt text, keyboard navigation, ARIA attributes across all components
- [X] T103 [P] Add pagination component and integrate with patient/doctor/appointment list pages in src/components/shared/pagination.tsx
- [X] T104 Security hardening: rate limiting on auth endpoints, input sanitization, CSRF verification in src/middleware.ts and src/app/api/
- [X] T105 Run full seed → quickstart.md validation (all 8 test scenarios) end-to-end
- [X] T106 Performance audit: check bundle size (<200KB gzip), LCP (<2.5s), phone lookup query time (<50ms)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — first story, MVP target
- **US2 (Phase 4)**: Depends on Foundational — can run parallel with US1
- **US3 (Phase 5)**: Depends on Foundational — can run parallel with US1/US2
- **US4 (Phase 6)**: Depends on Foundational + US2 (doctors must exist) — start after US2
- **US5 (Phase 7)**: Depends on Foundational + US3 (patients must exist) — start after US3
- **US6 (Phase 8)**: Depends on US2 + US3 (doctors and patients must exist) — start after US2 and US3
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational
    ↓
    ├── US1 (Clinic Setup) ←── MVP
    ├── US2 (Add Doctor) ←── can parallel with US1
    ├── US3 (Add Patient) ←── can parallel with US1/US2
    │       ↓
    ├── US4 (Doctor Dashboard) ←── needs US2 complete
    ├── US5 (Patient Portal) ←── needs US3 complete
    │       ↓
    └── US6 (Appointments) ←── needs US2 + US3 complete
            ↓
        Phase 9: Polish
```

### Within Each User Story

1. Zod validation schemas (parallel)
2. Service layer (depends on schemas)
3. API routes (depends on service)
4. UI pages (depends on API)
5. E2E tests (depends on UI)

### Parallel Opportunities

**Phase 1**: T003, T004, T005, T006 all parallel
**Phase 2**: T010–T012 parallel, T015–T018 parallel, T020–T025 parallel
**Phase 3**: T026–T028 parallel tests, T030–T031 parallel schemas, T037–T039 parallel auth pages
**Phase 4**: T043–T044 parallel tests, T046 parallel with other stories
**Phase 5**: T054–T055 parallel tests, T057 parallel with other stories
**Phase 6**: T082–T085 parallel tests and schemas
**Phase 9**: T098–T103 all parallel

---

## Parallel Example: User Story 2

```text
# Tests (parallel):
T043: Contract tests for doctor API in tests/contract/doctor-api.test.ts
T044: Unit tests for doctor service in tests/unit/services/doctor.test.ts

# Then sequential:
T046: Zod schemas in src/lib/validations/doctor.ts
T047: Doctor service in src/lib/services/doctor.service.ts
T048: Search API route
T049: CRUD API routes
T050: Doctor management page
T051: Add-doctor dialog
T052: SMS invitation wiring
T053: E2E test
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Clinic Registration + Setup)
4. **STOP and VALIDATE**: Test clinic registration flow independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Clinic Setup) → Test → Deploy (MVP!)
3. US2 (Add Doctor) + US3 (Add Patient) → Test → Deploy (core operations)
4. US4 (Doctor Dashboard) + US5 (Patient Portal) → Test → Deploy (self-service)
5. US6 (Appointments) → Test → Deploy (scheduling)
6. Polish → Final validation → Production

### Recommended Execution Path (Solo Developer)

```
Setup → Foundational → US1 → US2 → US3 → US4 → US5 → US6 → Polish
```

### Recommended Execution Path (2 Developers)

```
Both: Setup → Foundational
Dev A: US1 → US4 → US6
Dev B: US2 → US3 → US5 → Polish
```
