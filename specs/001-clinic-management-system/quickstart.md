# Quickstart: Clinic Management System

## Prerequisites

- Node.js 20 LTS
- PostgreSQL 16
- pnpm (package manager)

## Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL, Twilio credentials, etc.

# Run database migrations
pnpm prisma migrate dev

# Seed database with test data
pnpm prisma db seed

# Start development server
pnpm dev
```

App runs at `http://localhost:3000`

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/medisync
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
UPLOADTHING_SECRET=your-secret
UPLOADTHING_APP_ID=your-app-id
```

## Test Scenarios

### Scenario 1: Clinic Setup (US1)
1. Navigate to `/register`
2. Register as CLINIC_ADMIN with phone `+9641234567890`
3. Fill clinic details: name "Al-Noor Clinic", address, hours
4. Upload logo (optional)
5. **Verify**: Clinic appears in dashboard, all details saved

### Scenario 2: Add Doctor via Phone Lookup (US2)
1. Log in as clinic admin
2. Navigate to Clinic → Doctors → Add Doctor
3. Enter phone `+9649876543210`
4. **If existing**: Confirm identity, link to clinic
5. **If new**: Fill doctor details, submit
6. **Verify**: Doctor appears on clinic roster

### Scenario 3: Add Patient via Phone Lookup (US3)
1. Log in as clinic admin
2. Navigate to Clinic → Patients → Add Patient
3. Enter phone `+9641112223333`
4. **If existing**: Confirm identity, link to clinic
5. **If new**: Fill patient details (name, DOB, gender), submit
6. **Verify**: Patient appears on clinic patient list

### Scenario 4: Doctor Dashboard (US4)
1. Log in as doctor (phone from Scenario 2)
2. **Verify**: Dashboard shows today's appointments
3. Switch between clinics (if linked to multiple)
4. **Verify**: Data filters to selected clinic
5. View patient list, click patient
6. **Verify**: Only records from accessible clinics visible

### Scenario 5: Patient Portal (US5)
1. Log in as patient (phone from Scenario 3)
2. **Verify**: Dashboard shows clinics visited
3. Select a clinic
4. **Verify**: Visit history, files, notes from that clinic only
5. **Verify**: Other clinics' records not visible

### Scenario 6: Appointment Booking (US6)
1. Log in as clinic admin
2. Navigate to Appointments → Book
3. Select doctor, view available slots
4. Select date and time slot
5. Select patient, confirm booking
6. **Verify**: Appointment appears on doctor dashboard
7. **Verify**: Appointment appears on patient dashboard
8. Cancel appointment
9. **Verify**: Slot becomes available again

### Scenario 7: Cross-Clinic Doctor (Edge Case)
1. Create second clinic "Al-Salam Clinic"
2. Add same doctor (from Scenario 2) by phone number
3. **Verify**: Doctor appears on both clinic rosters
4. Log in as doctor
5. **Verify**: Both clinics appear in clinic switcher
6. **Verify**: Appointments/patients filter per clinic

### Scenario 8: Duplicate Prevention (Edge Case)
1. Try adding same doctor phone number that already exists
2. **Verify**: System shows existing doctor for linking, no duplicate created
3. Try adding same patient phone number that already exists
4. **Verify**: System shows existing patient for linking, no duplicate created

## Seed Data

The seed script creates:
- 2 clinics (Al-Noor Clinic, Al-Salam Clinic)
- 3 doctors (1 shared between both clinics)
- 5 patients (2 shared between clinics)
- 10 appointments (various statuses)
- 5 medical records with file attachments
- All user accounts with password: `Test1234`
