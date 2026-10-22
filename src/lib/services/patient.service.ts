import { prisma } from "@/lib/prisma";
import type { AddPatientToClinicInput, UpdatePatientInput } from "@/lib/validations/patient";

export async function searchPatientsByPhone(clinicId: string, phoneQuery: string) {
  const patients = await prisma.patient.findMany({
    where: { phone: { contains: phoneQuery } },
    include: {
      clinicPatients: { where: { clinicId } },
    },
    take: 10,
  });

  return patients.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    dateOfBirth: p.dateOfBirth,
    gender: p.gender,
    alreadyLinked: p.clinicPatients.length > 0,
  }));
}

export async function addPatientToClinic(clinicId: string, input: AddPatientToClinicInput) {
  if (input.action === "link") {
    const existing = await prisma.clinicPatient.findUnique({
      where: { clinicId_patientId: { clinicId, patientId: input.patientId } },
    });

    if (existing) throw new Error("Patient is already linked to this clinic");

    const clinicPatient = await prisma.clinicPatient.create({
      data: { clinicId, patientId: input.patientId },
      include: {
        patient: { select: { id: true, name: true, phone: true, dateOfBirth: true, gender: true } },
      },
    });
    return { clinicPatient, isNew: false };
  }

  // action === "create"
  const existingPatient = await prisma.patient.findUnique({ where: { phone: input.phone } });
  if (existingPatient) {
    throw new Error("Patient with this phone number already exists. Use link instead.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        phone: input.phone,
        name: input.name,
        passwordHash: "",
        role: "PATIENT",
      },
    });

    const patient = await tx.patient.create({
      data: {
        userId: user.id,
        phone: input.phone,
        name: input.name,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        gender: input.gender,
        bloodType: input.bloodType,
        address: input.address,
        emergencyContact: input.emergencyContact,
      },
    });

    const clinicPatient = await tx.clinicPatient.create({
      data: { clinicId, patientId: patient.id },
      include: {
        patient: { select: { id: true, name: true, phone: true, dateOfBirth: true, gender: true } },
      },
    });
    return clinicPatient;
  });

  return { clinicPatient: result, isNew: true };
}

export async function listPatientsInClinic(
  clinicId: string,
  options: { page: number; pageSize: number; search?: string }
) {
  const { page, pageSize, search } = options;
  const skip = (page - 1) * pageSize;

  const where = {
    clinicId,
    ...(search
      ? {
          patient: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search } },
            ],
          },
        }
      : {}),
  };

  const [total, clinicPatients] = await Promise.all([
    prisma.clinicPatient.count({ where }),
    prisma.clinicPatient.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: { registeredAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    patients: clinicPatients.map((cp) => ({
      ...cp.patient,
      registeredAt: cp.registeredAt,
      lastVisitAt: cp.lastVisitAt,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getPatientInClinicContext(clinicId: string, patientId: string) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return null;

  const clinicPatient = await prisma.clinicPatient.findUnique({
    where: { clinicId_patientId: { clinicId, patientId } },
  });
  if (!clinicPatient) return null;

  const records = await prisma.medicalRecord.findMany({
    where: { clinicId, patientId },
    include: {
      doctor: { select: { name: true } },
      _count: { select: { fileAttachments: true } },
    },
    orderBy: { visitDate: "desc" },
  });

  const appointments = await prisma.appointment.findMany({
    where: { clinicId, patientId, status: { notIn: ["CANCELLED"] } },
    include: { doctor: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 10,
  });

  return { patient, records, appointments };
}

export async function updatePatient(patientId: string, data: UpdatePatientInput) {
  return prisma.patient.update({
    where: { id: patientId },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
  });
}
