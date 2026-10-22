import { prisma } from "@/lib/prisma";
import type { CreateClinicInput, UpdateClinicInput } from "@/lib/validations/clinic";

export async function createClinic(ownerId: string, data: CreateClinicInput) {
  return prisma.clinic.create({
    data: {
      ...data,
      email: data.email || null,
      ownerId,
    },
  });
}

export async function getClinicById(clinicId: string) {
  return prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      _count: {
        select: {
          clinicDoctors: { where: { isActive: true } },
          clinicPatients: true,
        },
      },
    },
  });
}

export async function updateClinic(clinicId: string, ownerId: string, data: UpdateClinicInput) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) throw new Error("Clinic not found");
  if (clinic.ownerId !== ownerId) throw new Error("Forbidden: not the clinic owner");

  return prisma.clinic.update({
    where: { id: clinicId },
    data: {
      ...data,
      email: data.email || null,
    },
  });
}

export async function listClinicsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      clinicsOwned: true,
      doctor: {
        include: {
          clinicDoctors: {
            where: { isActive: true },
            include: { clinic: true },
          },
        },
      },
      patient: {
        include: {
          clinicPatients: {
            include: { clinic: true },
          },
        },
      },
    },
  });

  if (!user) return [];

  const clinics: Array<{
    id: string;
    name: string;
    logoUrl: string | null;
    role: string;
  }> = [];

  if (user.role === "CLINIC_ADMIN") {
    clinics.push(
      ...user.clinicsOwned.map((c) => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl,
        role: "OWNER",
      }))
    );
  }

  if (user.doctor) {
    for (const cd of user.doctor.clinicDoctors) {
      if (!clinics.some((c) => c.id === cd.clinic.id)) {
        clinics.push({
          id: cd.clinic.id,
          name: cd.clinic.name,
          logoUrl: cd.clinic.logoUrl,
          role: "DOCTOR",
        });
      }
    }
  }

  if (user.patient) {
    for (const cp of user.patient.clinicPatients) {
      if (!clinics.some((c) => c.id === cp.clinic.id)) {
        clinics.push({
          id: cp.clinic.id,
          name: cp.clinic.name,
          logoUrl: cp.clinic.logoUrl,
          role: "PATIENT",
        });
      }
    }
  }

  return clinics;
}

export async function updateClinicLogo(clinicId: string, ownerId: string, logoUrl: string) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) throw new Error("Clinic not found");
  if (clinic.ownerId !== ownerId) throw new Error("Forbidden");

  return prisma.clinic.update({
    where: { id: clinicId },
    data: { logoUrl },
  });
}

export async function updateClinicCover(clinicId: string, ownerId: string, coverUrl: string) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) throw new Error("Clinic not found");
  if (clinic.ownerId !== ownerId) throw new Error("Forbidden");

  return prisma.clinic.update({
    where: { id: clinicId },
    data: { coverUrl },
  });
}
