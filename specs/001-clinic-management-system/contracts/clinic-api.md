# Clinic API Contract

All endpoints require `Authorization: Bearer <token>`.

## POST /api/clinics

Create new clinic. Caller becomes clinic owner.

**Auth**: CLINIC_ADMIN role

**Request**:
```json
{
  "name": "string",
  "address": "string",
  "phone": "string",
  "email": "string | null",
  "timezone": "string (IANA)",
  "operatingHours": {
    "mon": { "open": "09:00", "close": "17:00" },
    "tue": { "open": "09:00", "close": "17:00" }
  }
}
```

**Response 201**:
```json
{
  "clinic": {
    "id": "uuid",
    "name": "string",
    "address": "string",
    "phone": "string",
    "email": "string | null",
    "timezone": "string",
    "operatingHours": {},
    "logoUrl": null,
    "coverUrl": null,
    "createdAt": "iso-date"
  }
}
```

**Errors**: 400 (validation), 403 (not CLINIC_ADMIN)

## GET /api/clinics/:clinicId

Get clinic details.

**Auth**: Any authenticated user associated with clinic

**Response 200**:
```json
{
  "clinic": {
    "id": "uuid",
    "name": "string",
    "address": "string",
    "phone": "string",
    "email": "string | null",
    "timezone": "string",
    "operatingHours": {},
    "logoUrl": "string | null",
    "coverUrl": "string | null",
    "doctorCount": 5,
    "patientCount": 150,
    "isOwner": true
  }
}
```

## PATCH /api/clinics/:clinicId

Update clinic details.

**Auth**: Clinic owner only

**Request**: Partial clinic fields (name, address, phone, email, timezone, operatingHours)

**Response 200**: Updated clinic object

## POST /api/clinics/:clinicId/logo

Upload clinic logo.

**Auth**: Clinic owner

**Request**: Multipart form data, `file` field (JPG/PNG, max 5MB)

**Response 200**:
```json
{
  "logoUrl": "string"
}
```

## POST /api/clinics/:clinicId/cover

Upload clinic cover photo.

**Auth**: Clinic owner

**Request**: Multipart form data, `file` field (JPG/PNG, max 5MB)

**Response 200**:
```json
{
  "coverUrl": "string"
}
```

## GET /api/clinics

List clinics for current user.

**Auth**: Any authenticated user

**Response 200**:
```json
{
  "clinics": [
    {
      "id": "uuid",
      "name": "string",
      "logoUrl": "string | null",
      "role": "OWNER | DOCTOR | PATIENT"
    }
  ]
}
```
