# Doctor API Contract

All endpoints require `Authorization: Bearer <token>`.

## GET /api/clinics/:clinicId/doctors/search?phone=+964XXX

Search existing doctors by phone number for linking.

**Auth**: CLINIC_ADMIN at this clinic

**Query**: `phone` — partial or full E.164 number (min 7 digits)

**Response 200**:
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "string",
      "phone": "+964XXXXXXXXXX",
      "avatarUrl": "string | null",
      "specialization": "string | null",
      "alreadyLinked": false
    }
  ]
}
```

Only returns name, avatar, specialization for identity confirmation. No sensitive data.

## POST /api/clinics/:clinicId/doctors

Add doctor to clinic. Links existing or creates new.

**Auth**: CLINIC_ADMIN at this clinic

**Request (link existing)**:
```json
{
  "doctorId": "uuid"
}
```

**Request (create new)**:
```json
{
  "phone": "+964XXXXXXXXXX",
  "name": "string",
  "specialization": "string | null"
}
```

**Response 201**:
```json
{
  "clinicDoctor": {
    "id": "uuid",
    "doctorId": "uuid",
    "clinicId": "uuid",
    "doctor": {
      "id": "uuid",
      "name": "string",
      "phone": "+964XXXXXXXXXX",
      "specialization": "string | null"
    },
    "role": "ATTENDING",
    "isActive": true,
    "joinedAt": "iso-date"
  },
  "isNew": true,
  "invitationSent": true
}
```

**Errors**: 400 (validation), 409 (already linked)

## GET /api/clinics/:clinicId/doctors

List doctors at a clinic.

**Auth**: Any user associated with clinic

**Response 200**:
```json
{
  "doctors": [
    {
      "id": "uuid",
      "name": "string",
      "phone": "+964XXXXXXXXXX",
      "specialization": "string | null",
      "avatarUrl": "string | null",
      "role": "ATTENDING",
      "isActive": true,
      "joinedAt": "iso-date"
    }
  ]
}
```

## DELETE /api/clinics/:clinicId/doctors/:doctorId

Remove doctor from clinic (soft delete — sets `isActive: false`, `leftAt: now`).

**Auth**: CLINIC_ADMIN at this clinic

**Response 200**:
```json
{
  "message": "Doctor removed from clinic"
}
```

## GET /api/doctors/me/dashboard

Doctor dashboard data.

**Auth**: DOCTOR role

**Query**: `clinicId` (optional — filter by clinic, omit for all clinics)

**Response 200**:
```json
{
  "doctor": {
    "id": "uuid",
    "name": "string",
    "specialization": "string | null"
  },
  "clinics": [
    {
      "id": "uuid",
      "name": "string",
      "logoUrl": "string | null"
    }
  ],
  "todayAppointments": [
    {
      "id": "uuid",
      "patientName": "string",
      "clinicName": "string",
      "startTime": "10:00",
      "endTime": "10:30",
      "status": "SCHEDULED"
    }
  ],
  "stats": {
    "totalPatients": 150,
    "totalAppointments": 430,
    "thisWeekAppointments": 12,
    "completedToday": 3
  }
}
```

## GET /api/doctors/me/patients?clinicId=uuid

List patients visible to this doctor at a specific clinic.

**Auth**: DOCTOR role, linked to clinic

**Response 200**:
```json
{
  "patients": [
    {
      "id": "uuid",
      "name": "string",
      "phone": "+964XXXXXXXXXX",
      "lastVisit": "iso-date | null"
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```
