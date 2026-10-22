# Data Model: Clinic Management System

**Date**: 2026-05-26 | **Status**: Complete

## Entity Diagram

```
User (1) ──── (0..1) Doctor
  │
  └──── (0..1) Patient
  │
  └──── (0..1) ClinicAdmin

Clinic (1) ──┬── (*) ClinicDoctor ──── (1) Doctor
             ├── (*) ClinicPatient ──── (1) Patient
             └── (*) Appointment

Doctor (1) ──┬── (*) ClinicDoctor
             ├── (*) DoctorSchedule
             └── (*) Appointment

Patient (1) ──┬── (*) ClinicPatient
              ├── (*) Appointment
              └── (*) MedicalRecord

MedicalRecord (1) ──── (*) FileAttachment
```

## Entities

### User

Authentication identity. One user maps to one role entity (Doctor, Patient, or ClinicAdmin).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| phone | String | UNIQUE, NOT NULL | E.164 format |
| passwordHash | String | NOT NULL | bcrypt |
| role | Enum(CLINIC_ADMIN, DOCTOR, PATIENT) | NOT NULL | |
| name | String | NOT NULL | Display name |
| email | String | UNIQUE, nullable | Optional contact |
| avatarUrl | String | nullable | Profile photo |
| isActive | Boolean | DEFAULT true | Soft disable |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | Auto-update | |

**Indexes**: `phone` (unique), `email` (unique, where not null), `role`

### Clinic

Physical clinic location.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| name | String | NOT NULL | |
| address | String | NOT NULL | Full address |
| phone | String | NOT NULL | Clinic contact number |
| email | String | nullable | |
| logoUrl | String | nullable | Branding |
| coverUrl | String | nullable | Cover photo |
| timezone | String | NOT NULL, DEFAULT 'UTC' | IANA timezone |
| operatingHours | JSON | NOT NULL | `{ mon: {open: "09:00", close: "17:00"}, ... }` |
| isActive | Boolean | DEFAULT true | |
| ownerId | UUID | FK → User | Clinic owner/creator |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | Auto-update | |

**Indexes**: `ownerId`, `phone`

### Doctor

Medical professional profile. Separate from User to allow linking across clinics.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User, UNIQUE | Auth link |
| phone | String | UNIQUE, NOT NULL | Deduplication key (E.164) |
| name | String | NOT NULL | |
| specialization | String | nullable | Medical specialty |
| licenseNumber | String | nullable | Professional license |
| bio | String | nullable | Profile description |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | Auto-update | |

**Indexes**: `phone` (unique), `userId` (unique)

### Patient

Patient profile. Separate from User, linked across clinics.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User, UNIQUE, nullable | Nullable until patient registers |
| phone | String | UNIQUE, NOT NULL | Deduplication key (E.164) |
| name | String | NOT NULL | |
| dateOfBirth | Date | nullable | |
| gender | Enum(MALE, FEMALE, OTHER) | nullable | |
| bloodType | String | nullable | |
| address | String | nullable | |
| emergencyContact | String | nullable | Phone number |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | Auto-update | |

**Indexes**: `phone` (unique), `userId` (unique, where not null)

### ClinicDoctor (Junction)

Many-to-many: which doctors work at which clinics.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| clinicId | UUID | FK → Clinic | |
| doctorId | UUID | FK → Doctor | |
| role | Enum(ATTENDING, CONSULTANT, VISITING) | DEFAULT ATTENDING | |
| isActive | Boolean | DEFAULT true | False = removed but history preserved |
| joinedAt | DateTime | DEFAULT now() | |
| leftAt | DateTime | nullable | Set when removed |

**Indexes**: `(clinicId, doctorId)` unique composite, `clinicId`, `doctorId`

### ClinicPatient (Junction)

Many-to-many: which patients are registered at which clinics.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| clinicId | UUID | FK → Clinic | |
| patientId | UUID | FK → Patient | |
| registeredAt | DateTime | DEFAULT now() | |
| lastVisitAt | DateTime | nullable | |

**Indexes**: `(clinicId, patientId)` unique composite, `clinicId`, `patientId`

### DoctorSchedule

Recurring weekly availability per doctor per clinic.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| doctorId | UUID | FK → Doctor | |
| clinicId | UUID | FK → Clinic | |
| dayOfWeek | Int | 0-6 (Sun-Sat) | |
| startTime | String | NOT NULL | "09:00" format |
| endTime | String | NOT NULL | "17:00" format |
| slotDurationMinutes | Int | DEFAULT 30 | |
| isActive | Boolean | DEFAULT true | |

**Indexes**: `(doctorId, clinicId, dayOfWeek)` unique composite

### Appointment

Scheduled visit linking patient, doctor, clinic, and time.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| clinicId | UUID | FK → Clinic | |
| doctorId | UUID | FK → Doctor | |
| patientId | UUID | FK → Patient | |
| date | Date | NOT NULL | |
| startTime | String | NOT NULL | "10:00" format |
| endTime | String | NOT NULL | "10:30" format |
| status | Enum(SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW) | DEFAULT SCHEDULED | |
| notes | String | nullable | Pre-appointment notes |
| cancelReason | String | nullable | |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | Auto-update | |

**Indexes**: `(doctorId, clinicId, date, startTime)` unique composite (conflict prevention), `clinicId`, `patientId`, `date`

**State transitions**:
- SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED
- SCHEDULED → CANCELLED
- CONFIRMED → CANCELLED
- CONFIRMED → NO_SHOW

### MedicalRecord

Per-visit clinical record.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| appointmentId | UUID | FK → Appointment, nullable | Linked visit |
| clinicId | UUID | FK → Clinic | Data isolation |
| doctorId | UUID | FK → Doctor | Author |
| patientId | UUID | FK → Patient | Subject |
| diagnosis | String | nullable | |
| notes | Text | nullable | Clinical notes |
| prescription | Text | nullable | |
| visitDate | Date | NOT NULL | |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | Auto-update | |

**Indexes**: `(clinicId, patientId)` composite, `appointmentId`, `doctorId`

### FileAttachment

Files attached to medical records.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| recordId | UUID | FK → MedicalRecord | |
| fileName | String | NOT NULL | Original filename |
| fileUrl | String | NOT NULL | Storage URL |
| fileType | String | NOT NULL | MIME type |
| fileSize | Int | NOT NULL | Bytes, max 20MB |
| uploadedBy | UUID | FK → User | |
| createdAt | DateTime | DEFAULT now() | |

**Indexes**: `recordId`

## Validation Rules

- **Phone numbers**: Must match E.164 format regex: `^\+[1-9]\d{1,14}$`
- **Passwords**: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit
- **File uploads**: Max 20MB, allowed types: `application/pdf`, `image/jpeg`, `image/png`
- **Operating hours**: Each day must have `open` < `close`, times in `HH:mm` format
- **Appointments**: `startTime` < `endTime`, date must be today or future, no overlapping slots per doctor+clinic+date
- **Slot duration**: Must be between 10 and 120 minutes
