# Patient API Contract

All endpoints require `Authorization: Bearer <token>`.

## GET /api/clinics/:clinicId/patients/search?phone=+964XXX

Search existing patients by phone number for linking.

**Auth**: CLINIC_ADMIN or DOCTOR at this clinic

**Query**: `phone` — partial or full E.164 number (min 7 digits)

**Response 200**:
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "string",
      "phone": "+964XXXXXXXXXX",
      "dateOfBirth": "date | null",
      "gender": "MALE | FEMALE | OTHER | null",
      "alreadyLinked": false
    }
  ]
}
```

## POST /api/clinics/:clinicId/patients

Add patient to clinic. Links existing or creates new.

**Auth**: CLINIC_ADMIN or DOCTOR at this clinic

**Request (link existing)**:
```json
{
  "patientId": "uuid"
}
```

**Request (create new)**:
```json
{
  "phone": "+964XXXXXXXXXX",
  "name": "string",
  "dateOfBirth": "date | null",
  "gender": "MALE | FEMALE | OTHER | null",
  "bloodType": "string | null",
  "address": "string | null",
  "emergencyContact": "string | null"
}
```

**Response 201**:
```json
{
  "clinicPatient": {
    "id": "uuid",
    "patientId": "uuid",
    "clinicId": "uuid",
    "patient": {
      "id": "uuid",
      "name": "string",
      "phone": "+964XXXXXXXXXX",
      "dateOfBirth": "date | null",
      "gender": "MALE | FEMALE | OTHER | null"
    },
    "registeredAt": "iso-date"
  },
  "isNew": true
}
```

**Errors**: 400 (validation), 409 (already linked)

## GET /api/clinics/:clinicId/patients

List patients at a clinic.

**Auth**: CLINIC_ADMIN or DOCTOR at this clinic

**Query**: `page`, `pageSize`, `search` (name or phone)

**Response 200**:
```json
{
  "patients": [
    {
      "id": "uuid",
      "name": "string",
      "phone": "+964XXXXXXXXXX",
      "dateOfBirth": "date | null",
      "gender": "MALE | FEMALE | OTHER | null",
      "lastVisit": "iso-date | null",
      "registeredAt": "iso-date"
    }
  ],
  "total": 500,
  "page": 1,
  "pageSize": 20
}
```

## GET /api/clinics/:clinicId/patients/:patientId

Get patient details within clinic context.

**Auth**: CLINIC_ADMIN or DOCTOR at this clinic

**Response 200**:
```json
{
  "patient": {
    "id": "uuid",
    "name": "string",
    "phone": "+964XXXXXXXXXX",
    "dateOfBirth": "date | null",
    "gender": "MALE | FEMALE | OTHER | null",
    "bloodType": "string | null",
    "address": "string | null",
    "emergencyContact": "string | null"
  },
  "records": [
    {
      "id": "uuid",
      "visitDate": "date",
      "doctorName": "string",
      "diagnosis": "string | null",
      "hasFiles": true
    }
  ],
  "appointments": [
    {
      "id": "uuid",
      "date": "date",
      "startTime": "10:00",
      "doctorName": "string",
      "status": "SCHEDULED"
    }
  ]
}
```

## PATCH /api/patients/:patientId

Update patient shared profile fields.

**Auth**: Patient themselves, or CLINIC_ADMIN at a linked clinic

**Request**: Partial patient fields (name, dateOfBirth, gender, bloodType, address, emergencyContact)

**Response 200**: Updated patient object

## GET /api/patients/me/dashboard

Patient dashboard data.

**Auth**: PATIENT role

**Response 200**:
```json
{
  "patient": {
    "id": "uuid",
    "name": "string"
  },
  "clinics": [
    {
      "id": "uuid",
      "name": "string",
      "logoUrl": "string | null",
      "lastVisit": "iso-date | null",
      "visitCount": 5
    }
  ],
  "upcomingAppointments": [
    {
      "id": "uuid",
      "date": "date",
      "startTime": "10:00",
      "clinicName": "string",
      "doctorName": "string",
      "status": "CONFIRMED"
    }
  ]
}
```

## GET /api/patients/me/clinics/:clinicId/records

Patient views their records at a specific clinic.

**Auth**: PATIENT role, linked to clinic

**Response 200**:
```json
{
  "records": [
    {
      "id": "uuid",
      "visitDate": "date",
      "doctorName": "string",
      "diagnosis": "string | null",
      "notes": "string | null",
      "prescription": "string | null",
      "files": [
        {
          "id": "uuid",
          "fileName": "string",
          "fileUrl": "string",
          "fileType": "string"
        }
      ]
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 10
}
```
