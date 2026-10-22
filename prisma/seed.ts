import "dotenv/config";
import { PrismaClient, Role, Gender, DoctorRole, AppointmentStatus } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await hash("Test1234", 12);

  // Create clinic admin users
  const adminUser1 = await prisma.user.upsert({
    where: { phone: "+9641000000001" },
    update: {},
    create: {
      phone: "+9641000000001",
      passwordHash,
      role: Role.CLINIC_ADMIN,
      name: "Dr. Ahmed Al-Rashid",
      email: "ahmed@alnoor.iq",
    },
  });

  const adminUser2 = await prisma.user.upsert({
    where: { phone: "+9641000000002" },
    update: {},
    create: {
      phone: "+9641000000002",
      passwordHash,
      role: Role.CLINIC_ADMIN,
      name: "Dr. Sara Hassan",
      email: "sara@alsalam.iq",
    },
  });

  // Create clinics
  const clinic1 = await prisma.clinic.upsert({
    where: { id: "clinic-001" },
    update: {},
    create: {
      id: "clinic-001",
      name: "Al-Noor Clinic",
      address: "123 Al-Mansour St, Baghdad, Iraq",
      phone: "+96414001234",
      email: "info@alnoor.iq",
      timezone: "Asia/Baghdad",
      operatingHours: {
        mon: { open: "09:00", close: "17:00" },
        tue: { open: "09:00", close: "17:00" },
        wed: { open: "09:00", close: "17:00" },
        thu: { open: "09:00", close: "17:00" },
        sat: { open: "09:00", close: "13:00" },
      },
      ownerId: adminUser1.id,
    },
  });

  const clinic2 = await prisma.clinic.upsert({
    where: { id: "clinic-002" },
    update: {},
    create: {
      id: "clinic-002",
      name: "Al-Salam Clinic",
      address: "456 Karrada St, Baghdad, Iraq",
      phone: "+96414005678",
      email: "info@alsalam.iq",
      timezone: "Asia/Baghdad",
      operatingHours: {
        mon: { open: "08:00", close: "16:00" },
        tue: { open: "08:00", close: "16:00" },
        wed: { open: "08:00", close: "16:00" },
        fri: { open: "10:00", close: "14:00" },
      },
      ownerId: adminUser2.id,
    },
  });

  // Create doctor users
  const doctorUser1 = await prisma.user.upsert({
    where: { phone: "+9641000000010" },
    update: {},
    create: {
      phone: "+9641000000010",
      passwordHash,
      role: Role.DOCTOR,
      name: "Dr. Karim Mansouri",
    },
  });

  const doctorUser2 = await prisma.user.upsert({
    where: { phone: "+9641000000011" },
    update: {},
    create: {
      phone: "+9641000000011",
      passwordHash,
      role: Role.DOCTOR,
      name: "Dr. Layla Ibrahim",
    },
  });

  const doctorUser3 = await prisma.user.upsert({
    where: { phone: "+9641000000012" },
    update: {},
    create: {
      phone: "+9641000000012",
      passwordHash,
      role: Role.DOCTOR,
      name: "Dr. Omar Khalid",
    },
  });

  // Create doctor profiles
  const doctor1 = await prisma.doctor.upsert({
    where: { userId: doctorUser1.id },
    update: {},
    create: {
      userId: doctorUser1.id,
      phone: "+9641000000010",
      name: "Dr. Karim Mansouri",
      specialization: "Internal Medicine",
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: doctorUser2.id },
    update: {},
    create: {
      userId: doctorUser2.id,
      phone: "+9641000000011",
      name: "Dr. Layla Ibrahim",
      specialization: "Pediatrics",
    },
  });

  const doctor3 = await prisma.doctor.upsert({
    where: { userId: doctorUser3.id },
    update: {},
    create: {
      userId: doctorUser3.id,
      phone: "+9641000000012",
      name: "Dr. Omar Khalid",
      specialization: "General Practice",
    },
  });

  // Link doctors to clinics (doctor3 is shared between both clinics)
  await prisma.clinicDoctor.upsert({
    where: { clinicId_doctorId: { clinicId: clinic1.id, doctorId: doctor1.id } },
    update: {},
    create: { clinicId: clinic1.id, doctorId: doctor1.id, role: DoctorRole.ATTENDING },
  });

  await prisma.clinicDoctor.upsert({
    where: { clinicId_doctorId: { clinicId: clinic1.id, doctorId: doctor3.id } },
    update: {},
    create: { clinicId: clinic1.id, doctorId: doctor3.id, role: DoctorRole.CONSULTANT },
  });

  await prisma.clinicDoctor.upsert({
    where: { clinicId_doctorId: { clinicId: clinic2.id, doctorId: doctor2.id } },
    update: {},
    create: { clinicId: clinic2.id, doctorId: doctor2.id, role: DoctorRole.ATTENDING },
  });

  await prisma.clinicDoctor.upsert({
    where: { clinicId_doctorId: { clinicId: clinic2.id, doctorId: doctor3.id } },
    update: {},
    create: { clinicId: clinic2.id, doctorId: doctor3.id, role: DoctorRole.VISITING },
  });

  // Create patient users
  const patientUser1 = await prisma.user.upsert({
    where: { phone: "+9641000000020" },
    update: {},
    create: {
      phone: "+9641000000020",
      passwordHash,
      role: Role.PATIENT,
      name: "Ali Hassan",
    },
  });

  const patientUser2 = await prisma.user.upsert({
    where: { phone: "+9641000000021" },
    update: {},
    create: {
      phone: "+9641000000021",
      passwordHash,
      role: Role.PATIENT,
      name: "Fatima Al-Zahra",
    },
  });

  // Create patient profiles
  const patient1 = await prisma.patient.upsert({
    where: { phone: "+9641000000020" },
    update: {},
    create: {
      userId: patientUser1.id,
      phone: "+9641000000020",
      name: "Ali Hassan",
      gender: Gender.MALE,
      dateOfBirth: new Date("1990-03-15"),
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { phone: "+9641000000021" },
    update: {},
    create: {
      userId: patientUser2.id,
      phone: "+9641000000021",
      name: "Fatima Al-Zahra",
      gender: Gender.FEMALE,
      dateOfBirth: new Date("1985-07-22"),
    },
  });

  const patient3 = await prisma.patient.upsert({
    where: { phone: "+9641000000022" },
    update: {},
    create: {
      phone: "+9641000000022",
      name: "Mohammed Kareem",
      gender: Gender.MALE,
    },
  });

  // Link patients to clinics
  await prisma.clinicPatient.upsert({
    where: { clinicId_patientId: { clinicId: clinic1.id, patientId: patient1.id } },
    update: {},
    create: { clinicId: clinic1.id, patientId: patient1.id },
  });

  await prisma.clinicPatient.upsert({
    where: { clinicId_patientId: { clinicId: clinic1.id, patientId: patient3.id } },
    update: {},
    create: { clinicId: clinic1.id, patientId: patient3.id },
  });

  await prisma.clinicPatient.upsert({
    where: { clinicId_patientId: { clinicId: clinic2.id, patientId: patient2.id } },
    update: {},
    create: { clinicId: clinic2.id, patientId: patient2.id },
  });

  await prisma.clinicPatient.upsert({
    where: { clinicId_patientId: { clinicId: clinic2.id, patientId: patient1.id } },
    update: {},
    create: { clinicId: clinic2.id, patientId: patient1.id },
  });

  // Create doctor schedules
  const daysOfWeek = [1, 2, 3, 4]; // Mon-Thu
  for (const day of daysOfWeek) {
    await prisma.doctorSchedule.upsert({
      where: { doctorId_clinicId_dayOfWeek: { doctorId: doctor1.id, clinicId: clinic1.id, dayOfWeek: day } },
      update: {},
      create: {
        doctorId: doctor1.id,
        clinicId: clinic1.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: 30,
      },
    });
  }

  // Create appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const appt1 = await prisma.appointment.create({
    data: {
      clinicId: clinic1.id,
      doctorId: doctor1.id,
      patientId: patient1.id,
      date: tomorrow,
      startTime: "10:00",
      endTime: "10:30",
      status: AppointmentStatus.CONFIRMED,
      notes: "Regular checkup",
    },
  });

  // Create a past appointment for medical record
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 7);
  pastDate.setHours(0, 0, 0, 0);

  const appt2 = await prisma.appointment.create({
    data: {
      clinicId: clinic1.id,
      doctorId: doctor1.id,
      patientId: patient1.id,
      date: pastDate,
      startTime: "11:00",
      endTime: "11:30",
      status: AppointmentStatus.COMPLETED,
    },
  });

  // Create medical record
  const record = await prisma.medicalRecord.create({
    data: {
      appointmentId: appt2.id,
      clinicId: clinic1.id,
      doctorId: doctor1.id,
      patientId: patient1.id,
      diagnosis: "Hypertension - Stage 1",
      notes: "Patient presents with elevated blood pressure. Prescribed lifestyle changes.",
      prescription: "Amlodipine 5mg once daily",
      visitDate: pastDate,
    },
  });

  // ─── Quick-access accounts with rich fake data ───────────────────────

  const adminPassword = await hash("admin", 12);
  const doctorPassword = await hash("doctor", 12);
  const patientPassword = await hash("patient", 12);

  // --- Admin user + clinic ---
  const quickAdmin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      phone: "+9640000000001",
      username: "admin",
      passwordHash: adminPassword,
      role: Role.CLINIC_ADMIN,
      name: "Dr. Yusuf Al-Bayati",
      email: "admin@medisync.local",
    },
  });

  const adminClinic = await prisma.clinic.upsert({
    where: { id: "clinic-admin" },
    update: {},
    create: {
      id: "clinic-admin",
      name: "MediSync Central Clinic",
      address: "42 Palestine St, Baghdad, Iraq",
      phone: "+96410000001",
      email: "info@medisync-central.iq",
      timezone: "Asia/Baghdad",
      operatingHours: {
        sun: { open: "08:00", close: "18:00" },
        mon: { open: "08:00", close: "18:00" },
        tue: { open: "08:00", close: "18:00" },
        wed: { open: "08:00", close: "18:00" },
        thu: { open: "08:00", close: "16:00" },
        sat: { open: "09:00", close: "14:00" },
      },
      ownerId: quickAdmin.id,
    },
  });

  // --- Doctor user (login: doctor/doctor) ---
  const quickDoctorUser = await prisma.user.upsert({
    where: { username: "doctor" },
    update: {},
    create: {
      phone: "+9640000000002",
      username: "doctor",
      passwordHash: doctorPassword,
      role: Role.DOCTOR,
      name: "Dr. Nadia Mustafa",
    },
  });

  const quickDoctor = await prisma.doctor.upsert({
    where: { userId: quickDoctorUser.id },
    update: {},
    create: {
      userId: quickDoctorUser.id,
      phone: "+9640000000002",
      name: "Dr. Nadia Mustafa",
      specialization: "Internal Medicine",
      licenseNumber: "IQ-MED-2019-4472",
      bio: "Board-certified internist with 8 years of experience in chronic disease management.",
    },
  });

  await prisma.clinicDoctor.upsert({
    where: { clinicId_doctorId: { clinicId: adminClinic.id, doctorId: quickDoctor.id } },
    update: {},
    create: { clinicId: adminClinic.id, doctorId: quickDoctor.id, role: DoctorRole.ATTENDING },
  });

  // --- Additional doctors for admin clinic ---
  const extraDoctorData = [
    { phone: "+9640000000010", name: "Dr. Hassan Jawad", spec: "Cardiology", license: "IQ-MED-2015-3301", role: DoctorRole.CONSULTANT },
    { phone: "+9640000000011", name: "Dr. Zainab Ridha", spec: "Dermatology", license: "IQ-MED-2020-5518", role: DoctorRole.ATTENDING },
    { phone: "+9640000000012", name: "Dr. Tariq Saleem", spec: "Orthopedics", license: "IQ-MED-2012-2204", role: DoctorRole.VISITING },
  ];

  const extraDoctors = [];
  for (const d of extraDoctorData) {
    const u = await prisma.user.upsert({
      where: { phone: d.phone },
      update: {},
      create: { phone: d.phone, passwordHash, role: Role.DOCTOR, name: d.name },
    });
    const doc = await prisma.doctor.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, phone: d.phone, name: d.name, specialization: d.spec, licenseNumber: d.license },
    });
    await prisma.clinicDoctor.upsert({
      where: { clinicId_doctorId: { clinicId: adminClinic.id, doctorId: doc.id } },
      update: {},
      create: { clinicId: adminClinic.id, doctorId: doc.id, role: d.role },
    });
    extraDoctors.push(doc);
  }

  // --- Doctor schedules for admin clinic (quickDoctor + extras) ---
  const allClinicDoctors = [quickDoctor, ...extraDoctors];
  const scheduleConfigs = [
    { days: [0, 1, 2, 3, 4], start: "08:30", end: "16:30", slot: 30 },   // quickDoctor: Sun-Thu
    { days: [0, 1, 3], start: "09:00", end: "14:00", slot: 20 },          // Hassan (cardio)
    { days: [1, 2, 3, 4], start: "10:00", end: "17:00", slot: 30 },       // Zainab (derm)
    { days: [0, 3], start: "08:00", end: "13:00", slot: 45 },             // Tariq (ortho, visiting)
  ];

  for (let i = 0; i < allClinicDoctors.length; i++) {
    const cfg = scheduleConfigs[i];
    for (const day of cfg.days) {
      await prisma.doctorSchedule.upsert({
        where: { doctorId_clinicId_dayOfWeek: { doctorId: allClinicDoctors[i].id, clinicId: adminClinic.id, dayOfWeek: day } },
        update: {},
        create: {
          doctorId: allClinicDoctors[i].id,
          clinicId: adminClinic.id,
          dayOfWeek: day,
          startTime: cfg.start,
          endTime: cfg.end,
          slotDurationMinutes: cfg.slot,
        },
      });
    }
  }

  // --- Patient user (login: patient/patient) ---
  const quickPatientUser = await prisma.user.upsert({
    where: { username: "patient" },
    update: {},
    create: {
      phone: "+9640000000003",
      username: "patient",
      passwordHash: patientPassword,
      role: Role.PATIENT,
      name: "Mariam Qasim",
    },
  });

  const quickPatient = await prisma.patient.upsert({
    where: { phone: "+9640000000003" },
    update: {},
    create: {
      userId: quickPatientUser.id,
      phone: "+9640000000003",
      name: "Mariam Qasim",
      gender: Gender.FEMALE,
      dateOfBirth: new Date("1992-06-14"),
      bloodType: "A+",
      address: "17 Zayouna District, Baghdad",
      emergencyContact: "+9647700112233",
    },
  });

  await prisma.clinicPatient.upsert({
    where: { clinicId_patientId: { clinicId: adminClinic.id, patientId: quickPatient.id } },
    update: {},
    create: { clinicId: adminClinic.id, patientId: quickPatient.id },
  });

  // --- Additional patients for admin clinic ---
  const extraPatientData = [
    { phone: "+9640000000020", name: "Samir Abboud", gender: Gender.MALE, dob: "1988-11-03", blood: "O+", address: "Jadiriya, Baghdad" },
    { phone: "+9640000000021", name: "Reem Al-Khafaji", gender: Gender.FEMALE, dob: "1975-02-28", blood: "B-", address: "Karrada, Baghdad" },
    { phone: "+9640000000022", name: "Omar Hashim", gender: Gender.MALE, dob: "2001-09-10", blood: "AB+", address: "Mansour, Baghdad" },
    { phone: "+9640000000023", name: "Huda Nasser", gender: Gender.FEMALE, dob: "1965-04-17", blood: "O-", address: "Adhamiya, Baghdad" },
    { phone: "+9640000000024", name: "Aws Al-Tamimi", gender: Gender.MALE, dob: "1998-12-25", blood: "A-", address: "Dora, Baghdad" },
  ];

  const extraPatients = [];
  for (const p of extraPatientData) {
    const pu = await prisma.user.upsert({
      where: { phone: p.phone },
      update: {},
      create: { phone: p.phone, passwordHash, role: Role.PATIENT, name: p.name },
    });
    const pat = await prisma.patient.upsert({
      where: { phone: p.phone },
      update: {},
      create: {
        userId: pu.id,
        phone: p.phone,
        name: p.name,
        gender: p.gender,
        dateOfBirth: new Date(p.dob),
        bloodType: p.blood,
        address: p.address,
      },
    });
    await prisma.clinicPatient.upsert({
      where: { clinicId_patientId: { clinicId: adminClinic.id, patientId: pat.id } },
      update: {},
      create: { clinicId: adminClinic.id, patientId: pat.id },
    });
    extraPatients.push(pat);
  }

  const allClinicPatients = [quickPatient, ...extraPatients];

  // --- Past appointments + medical records (last 30 days) ---
  const diagnoses = [
    { diag: "Type 2 Diabetes - controlled", notes: "HbA1c at 6.8%. Continue current regimen.", rx: "Metformin 500mg twice daily" },
    { diag: "Acute Bronchitis", notes: "Productive cough for 5 days. Lungs clear on auscultation.", rx: "Amoxicillin 500mg TID x 7 days, Guaifenesin PRN" },
    { diag: "Lumbar Disc Herniation L4-L5", notes: "MRI confirms posterolateral herniation. Referred to physiotherapy.", rx: "Ibuprofen 400mg TID, Muscle relaxant PRN" },
    { diag: "Contact Dermatitis", notes: "Erythematous rash on forearms, likely occupational exposure.", rx: "Betamethasone cream 0.1% BID x 14 days" },
    { diag: "Hypertension - Stage 1", notes: "BP 148/92. Started lifestyle modifications.", rx: "Amlodipine 5mg daily" },
    { diag: "Iron Deficiency Anemia", notes: "Hb 9.2 g/dL, ferritin 8 ng/mL. Diet counseling provided.", rx: "Ferrous sulfate 325mg daily, Vitamin C 500mg daily" },
    { diag: "Migraine without aura", notes: "Recurrent episodes 3x/month. Triggers: stress, sleep deprivation.", rx: "Sumatriptan 50mg PRN, Propranolol 40mg daily" },
    { diag: "Gastroesophageal Reflux Disease", notes: "Heartburn and regurgitation for 3 weeks. No alarm symptoms.", rx: "Omeprazole 20mg daily x 8 weeks" },
    { diag: "Allergic Rhinitis", notes: "Seasonal symptoms. Sneezing, rhinorrhea, nasal congestion.", rx: "Cetirizine 10mg daily, Fluticasone nasal spray" },
    { diag: "Vitamin D Deficiency", notes: "25-OH Vit D: 12 ng/mL. Fatigue and muscle pain.", rx: "Cholecalciferol 50,000 IU weekly x 8 weeks" },
  ];

  const timeSlots = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00"];

  for (let daysAgo = 28; daysAgo >= 1; daysAgo -= 3) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5) continue; // skip Friday

    const numAppts = Math.min(3 + (daysAgo % 4), 6);
    for (let j = 0; j < numAppts; j++) {
      const docIdx = j % allClinicDoctors.length;
      const patIdx = (daysAgo + j) % allClinicPatients.length;
      const slot = timeSlots[j % timeSlots.length];
      const [h, m] = slot.split(":").map(Number);
      const endMin = m + 30;
      const endTime = `${String(h + Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
      const diagIdx = (daysAgo + j) % diagnoses.length;

      const appt = await prisma.appointment.create({
        data: {
          clinicId: adminClinic.id,
          doctorId: allClinicDoctors[docIdx].id,
          patientId: allClinicPatients[patIdx].id,
          date,
          startTime: slot,
          endTime,
          status: AppointmentStatus.COMPLETED,
          notes: diagnoses[diagIdx].notes,
        },
      });

      await prisma.medicalRecord.create({
        data: {
          appointmentId: appt.id,
          clinicId: adminClinic.id,
          doctorId: allClinicDoctors[docIdx].id,
          patientId: allClinicPatients[patIdx].id,
          diagnosis: diagnoses[diagIdx].diag,
          notes: diagnoses[diagIdx].notes,
          prescription: diagnoses[diagIdx].rx,
          visitDate: date,
        },
      });
    }
  }

  // --- Today's appointments (mix of statuses) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStatuses = [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.SCHEDULED,
  ];

  for (let j = 0; j < todayStatuses.length; j++) {
    const slot = timeSlots[j];
    const [h, m] = slot.split(":").map(Number);
    const endMin = m + 30;
    const endTime = `${String(h + Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    const docIdx = j % allClinicDoctors.length;
    const patIdx = j % allClinicPatients.length;

    await prisma.appointment.create({
      data: {
        clinicId: adminClinic.id,
        doctorId: allClinicDoctors[docIdx].id,
        patientId: allClinicPatients[patIdx].id,
        date: today,
        startTime: slot,
        endTime,
        status: todayStatuses[j],
        notes: j === 2 ? "Patient currently being seen" : undefined,
      },
    });
  }

  // --- Upcoming appointments (next 7 days) ---
  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5) continue; // skip Friday

    const numAppts = 2 + (daysAhead % 3);
    for (let j = 0; j < numAppts; j++) {
      const slot = timeSlots[j + 2];
      const [h, m] = slot.split(":").map(Number);
      const endMin = m + 30;
      const endTime = `${String(h + Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
      const docIdx = (daysAhead + j) % allClinicDoctors.length;
      const patIdx = (daysAhead + j + 1) % allClinicPatients.length;
      const status = j === 0 ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED;

      await prisma.appointment.create({
        data: {
          clinicId: adminClinic.id,
          doctorId: allClinicDoctors[docIdx].id,
          patientId: allClinicPatients[patIdx].id,
          date,
          startTime: slot,
          endTime,
          status,
        },
      });
    }
  }

  // --- Cancelled / no-show appointments ---
  const cancelDate = new Date();
  cancelDate.setDate(cancelDate.getDate() - 2);
  cancelDate.setHours(0, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      clinicId: adminClinic.id,
      doctorId: quickDoctor.id,
      patientId: extraPatients[2].id,
      date: cancelDate,
      startTime: "14:00",
      endTime: "14:30",
      status: AppointmentStatus.CANCELLED,
      cancelReason: "Patient requested reschedule",
    },
  });

  await prisma.appointment.create({
    data: {
      clinicId: adminClinic.id,
      doctorId: extraDoctors[0].id,
      patientId: extraPatients[3].id,
      date: cancelDate,
      startTime: "11:00",
      endTime: "11:30",
      status: AppointmentStatus.NO_SHOW,
    },
  });

  console.log("✅ Seeding complete!");
  console.log({
    clinics: 3,
    doctors: 7,
    patients: 9,
    passwords: "All phone accounts use password: Test1234",
    logins: {
      clinicAdmin1: "+9641000000001",
      clinicAdmin2: "+9641000000002",
      doctor1: "+9641000000010",
      doctor2: "+9641000000011",
      doctor3: "+9641000000012",
      patient1: "+9641000000020",
      patient2: "+9641000000021",
    },
    quickAccess: {
      admin: "admin/admin (CLINIC_ADMIN) — MediSync Central Clinic",
      doctor: "doctor/doctor (DOCTOR) — Dr. Nadia Mustafa, Internal Medicine",
      patient: "patient/patient (PATIENT) — Mariam Qasim",
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
