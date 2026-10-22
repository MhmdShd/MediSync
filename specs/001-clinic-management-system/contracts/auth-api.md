# Auth API Contract

## POST /api/auth/register

Register new user account.

**Request**:
```json
{
  "phone": "+964XXXXXXXXXX",
  "password": "string (min 8 chars)",
  "name": "string",
  "role": "CLINIC_ADMIN | DOCTOR | PATIENT"
}
```

**Response 201**:
```json
{
  "user": {
    "id": "uuid",
    "phone": "+964XXXXXXXXXX",
    "name": "string",
    "role": "CLINIC_ADMIN"
  },
  "token": "jwt-string"
}
```

**Errors**: 400 (validation), 409 (phone exists)

## POST /api/auth/login

Authenticate with phone + password.

**Request**:
```json
{
  "phone": "+964XXXXXXXXXX",
  "password": "string"
}
```

**Response 200**:
```json
{
  "user": {
    "id": "uuid",
    "phone": "+964XXXXXXXXXX",
    "name": "string",
    "role": "CLINIC_ADMIN",
    "avatarUrl": "string | null"
  },
  "token": "jwt-string"
}
```

**Errors**: 401 (invalid credentials), 403 (account disabled)

## POST /api/auth/reset-password

Request password reset via SMS.

**Request**:
```json
{
  "phone": "+964XXXXXXXXXX"
}
```

**Response 200**:
```json
{
  "message": "Reset code sent"
}
```

## POST /api/auth/reset-password/confirm

Confirm password reset with SMS code.

**Request**:
```json
{
  "phone": "+964XXXXXXXXXX",
  "code": "string (6 digits)",
  "newPassword": "string"
}
```

**Response 200**:
```json
{
  "message": "Password updated"
}
```

**Errors**: 400 (invalid code, expired code)

## GET /api/auth/me

Get current authenticated user.

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "user": {
    "id": "uuid",
    "phone": "+964XXXXXXXXXX",
    "name": "string",
    "role": "CLINIC_ADMIN",
    "avatarUrl": "string | null",
    "email": "string | null"
  }
}
```

**Errors**: 401 (not authenticated)
