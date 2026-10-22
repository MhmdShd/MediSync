# Appointment API Contract

All endpoints require `Authorization: Bearer <token>`.

## GET /api/clinics/:clinicId/doctors/:doctorId/availability?date=2026-06-01

Get available time slots for a doctor at a clinic on a date.

**Auth**: Any user associated with clinic, or PATIENT

**Response 200**:
```json
{
  "doctorId": "uuid",
  "clinicId": "uuid",
  "date": "2026-06-01",
  "slots": [
    { "startTime": "09:00", "endTime": "09:30", "available": true },
    { "startTime": "09:30", "endTime": "10:00", "available": false },
    { "startTime": "10:00", "endTime": "10:30", "available": true }
  ]
}
```

## POST /api/clinics/:clinicId/appointments

Book an appointment.

**Auth**: CLINIC_ADMIN, DOCTOR at clinic, or PATIENT linked to clinic

**Request**:
```json
{
  "doctorId": "uuid",
  "patientId": "uuid",
  "date": "2026-06-01",
  "startTime": "10:00",
  "endTime": "10:30",
  "notes": "string | null"
}
```

**Response 201**:
```json
{
  "appointment": {
    "id": "uuid",
    "clinicId": "uuid",
    "doctorId": "uuid",
    "patientId": "uuid",
    "date": "2026-06-01",
    "startTime": "10:00",
    "endTime": "10:30",
    "status": "SCHEDULED",
    "notes": "string | null",
    "createdAt": "iso-date"
  }
}
```

**Errors**: 400 (validation, past date), 409 (slot already booked)

## GET /api/clinics/:clinicId/appointments

List appointments at a clinic.

**Auth**: CLINIC_ADMIN or DOCTOR at this clinic

**Query**: `date`, `doctorId`, `patientId`, `status`, `page`, `pageSize`

**Response 200**:
```json
{
  "appointments": [
    {
      "id": "uuid",
      "date": "2026-06-01",
      "startTime": "10:00",
      "endTime": "10:30",
      "status": "SCHEDULED",
      "doctor": { "id": "uuid", "name": "string" },
      "patient": { "id": "uuid", "name": "string" }
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

## PATCH /api/clinics/:clinicId/appointments/:appointmentId

Update appointment status.

**Auth**: CLINIC_ADMIN or DOCTOR at this clinic

**Request**:
```json
{
  "status": "CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW",
  "cancelReason": "string (required if CANCELLED)"
}
```

**Response 200**: Updated appointment object

**Errors**: 400 (invalid state transition)

## DELETE /api/clinics/:clinicId/appointments/:appointmentId

Cancel appointment (convenience alias for PATCH with status=CANCELLED).

**Auth**: CLINIC_ADMIN, DOCTOR at clinic, or booking PATIENT

**Request**:
```json
{
  "reason": "string"
}
```

**Response 200**:
```json
{
  "message": "Appointment cancelled",
  "notifiedParties": ["doctor", "patient"]
}
```

## POST /api/clinics/:clinicId/doctors/:doctorId/schedule

Set doctor availability schedule at a clinic.

**Auth**: CLINIC_ADMIN or the DOCTOR themselves

**Request**:
```json
{
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDurationMinutes": 30
    }
  ]
}
```

**Response 200**:
```json
{
  "schedules": [
    {
      "id": "uuid",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDurationMinutes": 30,
      "isActive": true
    }
  ]
}
```

## POST /api/clinics/:clinicId/appointments/:appointmentId/records

Create medical record for an appointment.

**Auth**: DOCTOR at this clinic

**Request**:
```json
{
  "diagnosis": "string | null",
  "notes": "string | null",
  "prescription": "string | null"
}
```

**Response 201**:
```json
{
  "record": {
    "id": "uuid",
    "appointmentId": "uuid",
    "clinicId": "uuid",
    "doctorId": "uuid",
    "patientId": "uuid",
    "diagnosis": "string | null",
    "notes": "string | null",
    "prescription": "string | null",
    "visitDate": "2026-06-01",
    "createdAt": "iso-date"
  }
}
```

## POST /api/records/:recordId/files

Upload file attachment to medical record.

**Auth**: DOCTOR at the record's clinic

**Request**: Multipart form data, `file` field (PDF/JPG/PNG, max 20MB)

**Response 201**:
```json
{
  "file": {
    "id": "uuid",
    "fileName": "string",
    "fileUrl": "string",
    "fileType": "string",
    "fileSize": 1024000
  }
}
```

**Errors**: 400 (invalid file type, file too large)
