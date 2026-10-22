# Feature Specification: Clinic Management System

**Feature Branch**: `001-clinic-management-system`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "Build an app that works as a clinic management system, a clinic with multiple doctors, each doctor has his own profile, multiple doctors can work in multi clinics, so when a clinic adds a doctor it should scan existing doctors according to his phone number, same when a clinic creates a patient profile, because I want the doctors and patients to be able to login and see their stats/files/etc. Make the UI super duper user-friendly."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clinic Owner Registers and Sets Up Clinic (Priority: P1)

A clinic owner signs up, creates a clinic profile with name, address, operating hours, and contact details. This is the foundational action — nothing else works without at least one clinic existing in the system.

**Why this priority**: All other functionality (adding doctors, managing patients, appointments) depends on a clinic existing first.

**Independent Test**: Can be fully tested by creating a new account, completing clinic setup, and verifying the clinic appears in the system with all entered details.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they sign up and complete clinic registration, **Then** the clinic profile is created with all required fields and the owner is granted admin access
2. **Given** a clinic owner, **When** they edit clinic details (hours, address, contact), **Then** changes are saved and visible immediately
3. **Given** a clinic owner, **When** they upload a clinic logo and cover photo, **Then** the branding appears on the clinic's public-facing profile

---

### User Story 2 - Clinic Adds a Doctor (Phone Lookup) (Priority: P1)

A clinic admin adds a doctor to their clinic. The system searches existing doctors by phone number. If found, the doctor's existing profile is linked to this clinic. If not found, a new doctor profile is created and an invitation is sent.

**Why this priority**: Multi-clinic doctor sharing is a core differentiator. Doctors must exist before appointments or patient management can function.

**Independent Test**: Can be tested by entering a phone number, verifying lookup results, and confirming the doctor appears on the clinic's roster.

**Acceptance Scenarios**:

1. **Given** a clinic admin entering a phone number that matches an existing doctor, **When** they confirm the match, **Then** the existing doctor profile is linked to this clinic without duplicating data
2. **Given** a clinic admin entering a phone number with no match, **When** they complete the new doctor form, **Then** a new doctor profile is created and an invitation is sent via SMS
3. **Given** a doctor already linked to Clinic A, **When** Clinic B adds them by phone number, **Then** the doctor appears on both clinics' rosters and can switch between them
4. **Given** a clinic admin, **When** they search by phone number, **Then** results show the doctor's name and profile photo (no sensitive data) for identity confirmation

---

### User Story 3 - Clinic Creates a Patient Profile (Phone Lookup) (Priority: P1)

A clinic receptionist creates a patient profile. The system searches existing patients by phone number. If found, the existing patient is linked to this clinic. If not, a new patient profile is created. Patients can visit multiple clinics and their records are associated per-clinic.

**Why this priority**: Patient management is the core daily operation. Phone-based lookup prevents duplicate records across clinics.

**Independent Test**: Can be tested by entering a patient phone number, verifying lookup, and confirming the patient appears on the clinic's patient list.

**Acceptance Scenarios**:

1. **Given** a receptionist entering a phone number that matches an existing patient, **When** they confirm the match, **Then** the patient is linked to this clinic while preserving their cross-clinic identity
2. **Given** a receptionist entering a new phone number, **When** they fill out patient details (name, date of birth, gender, contact info), **Then** a new patient profile is created
3. **Given** a patient linked to multiple clinics, **When** viewed from Clinic A, **Then** only Clinic A's records (visits, files, notes) are visible — not Clinic B's records
4. **Given** a patient profile, **When** the receptionist updates contact info, **Then** the shared profile fields update across all clinics where the patient is linked

---

### User Story 4 - Doctor Logs In and Views Dashboard (Priority: P2)

A doctor logs in and sees a personalized dashboard showing their schedule, patient queue, and statistics across all clinics they work at. They can switch between clinics to see clinic-specific data.

**Why this priority**: Doctor self-service reduces administrative burden and enables doctors to manage their own workflow.

**Independent Test**: Can be tested by logging in as a doctor, verifying dashboard loads with correct data, and switching between clinics.

**Acceptance Scenarios**:

1. **Given** a doctor with credentials, **When** they log in, **Then** they see a dashboard with today's appointments across all their clinics
2. **Given** a doctor working at multiple clinics, **When** they select a specific clinic, **Then** the dashboard filters to show only that clinic's schedule and patients
3. **Given** a doctor, **When** they view their statistics, **Then** they see patient count, appointment count, and visit history summary
4. **Given** a doctor, **When** they view a patient's file, **Then** they see only records from clinics where they have access

---

### User Story 5 - Patient Logs In and Views Their Records (Priority: P2)

A patient logs in and sees their visit history, upcoming appointments, medical files, and prescriptions across all clinics they've visited. Each clinic's data is clearly separated.

**Why this priority**: Patient portal builds trust and reduces phone calls to clinics for basic information retrieval.

**Independent Test**: Can be tested by logging in as a patient, verifying records are visible and correctly grouped by clinic.

**Acceptance Scenarios**:

1. **Given** a patient with credentials, **When** they log in, **Then** they see a list of clinics they've visited with visit summaries
2. **Given** a patient, **When** they select a clinic, **Then** they see their visit history, uploaded files, and notes from that clinic
3. **Given** a patient with upcoming appointments, **When** they view their dashboard, **Then** upcoming appointments are displayed with date, time, clinic name, and doctor name
4. **Given** a patient, **When** they view their profile, **Then** they can update their contact information and personal details

---

### User Story 6 - Appointment Scheduling (Priority: P3)

A receptionist or patient books an appointment with a specific doctor at a specific clinic. The system shows available time slots based on the doctor's schedule at that clinic.

**Why this priority**: Appointments are a key workflow but require doctors, patients, and clinics to be set up first.

**Independent Test**: Can be tested by selecting a doctor, viewing available slots, booking an appointment, and verifying it appears on both doctor and patient dashboards.

**Acceptance Scenarios**:

1. **Given** a receptionist selecting a doctor, **When** they view availability, **Then** open time slots for that doctor at this clinic are displayed
2. **Given** an available slot, **When** the receptionist books it for a patient, **Then** the appointment is confirmed and both doctor and patient are notified
3. **Given** a booked appointment, **When** either party cancels, **Then** the slot becomes available again and the other party is notified
4. **Given** a patient logged in, **When** they browse available slots at a clinic, **Then** they can self-book an appointment

---

### Edge Cases

- What happens when a doctor is removed from a clinic? Historical records MUST remain accessible but no new appointments can be created at that clinic for the removed doctor.
- What happens when a patient's phone number changes? The clinic admin can update the phone number; the system MUST prevent creating a duplicate patient if the old number is searched.
- What happens when two clinics try to add the same doctor simultaneously? The system MUST handle concurrent linking without creating duplicate associations.
- How does the system handle a phone number registered to both a doctor and a patient? Doctor and patient are separate entity types — same phone number can exist in both pools without conflict.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support multi-tenant clinic management where each clinic operates independently
- **FR-002**: System MUST search existing doctors by phone number when a clinic adds a doctor, linking existing profiles rather than creating duplicates
- **FR-003**: System MUST search existing patients by phone number when a clinic creates a patient, linking existing profiles rather than creating duplicates
- **FR-004**: System MUST support doctors belonging to multiple clinics simultaneously with per-clinic data isolation
- **FR-005**: System MUST support patients visiting multiple clinics with per-clinic record separation
- **FR-006**: System MUST provide role-based access: clinic owner/admin, doctor, patient, receptionist
- **FR-007**: System MUST provide authentication for all user roles via phone number and password, including secure password reset flow
- **FR-008**: System MUST display doctor statistics (patient count, appointment count, visit history)
- **FR-009**: System MUST display patient records grouped by clinic with visit history and uploaded files
- **FR-010**: System MUST support appointment scheduling with doctor availability management
- **FR-011**: System MUST send notifications for appointment confirmations, cancellations, and reminders
- **FR-012**: System MUST enforce data privacy — doctors see only records from clinics where they have access, patients see only their own records
- **FR-013**: System MUST provide a responsive, intuitive interface following modern UX patterns (card-based layouts, clear navigation hierarchy, minimal clicks to complete tasks)

### Key Entities

- **Clinic**: Represents a physical clinic location with name, address, operating hours, branding, and staff roster
- **Doctor**: A medical professional with a unique phone number, personal profile, credentials, and associations to one or more clinics
- **Patient**: An individual with a unique phone number, personal details, and visit records across one or more clinics
- **User Account**: Authentication identity linked to a Doctor, Patient, or Clinic Admin role
- **Appointment**: A scheduled visit linking a patient, doctor, clinic, and time slot
- **Medical Record**: Per-visit notes, files, and prescriptions belonging to a specific patient-clinic-doctor combination
- **Clinic-Doctor Association**: The many-to-many relationship between clinics and doctors with role/permissions at each clinic
- **Clinic-Patient Association**: The many-to-many relationship between clinics and patients with per-clinic visit history

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clinic setup (registration through first doctor added) can be completed in under 5 minutes
- **SC-002**: Adding an existing doctor by phone lookup takes under 30 seconds
- **SC-003**: Adding an existing patient by phone lookup takes under 30 seconds
- **SC-004**: Doctors can switch between clinics and view relevant data in under 2 seconds
- **SC-005**: Patients can view their complete visit history across all clinics within 3 seconds of login
- **SC-006**: Zero duplicate doctor or patient profiles are created when the phone number already exists
- **SC-007**: System supports at least 100 clinics, 500 doctors, and 50,000 patients without degradation
- **SC-008**: 90% of first-time users can complete core tasks (add doctor, add patient, book appointment) without external help
- **SC-009**: All user-facing screens load and become interactive within 2 seconds on a standard connection

## Assumptions

- Users have reliable internet connectivity (no offline-first requirement for v1)
- Phone numbers are unique per person and serve as the primary deduplication key
- Each phone number maps to exactly one doctor profile and exactly one patient profile (a person can be both a doctor and a patient)
- SMS delivery infrastructure is available for sending invitations and notifications
- Clinics operate within a single country/region for v1 (single phone number format, single timezone per clinic)
- Existing authentication system is not present — auth will be built as part of this feature
- File uploads (medical records, images) are limited to common formats (PDF, JPG, PNG) with a maximum size of 20MB per file
- The system will be web-based with responsive design for mobile access (no native mobile app for v1)
