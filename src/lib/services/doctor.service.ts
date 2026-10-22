import { prisma } from "@/lib/prisma";
import { notificationService } from "./notification.service";
import type { AddDoctorToClinicInput, UpdateDoctorInClinicInput, UpdateDoctorProfileInput } from "@/lib/validations/doctor";

export async function searchDoctorsByPhone(clinicId: string, phoneQuery: string) {
  const doctors = await prisma.doctor.findMany({
    where: {
      phone: { contains: phoneQuery },
    },
    include: {
      user: { select: { avatarUrl: true } },
      clinicDoctors: { where: { clinicId } },
    },
    take: 10,
  });

  return doctors.map((d) => ({
    id: d.id,
    name: d.name,
    phone: d.phone,
    avatarUrl: d.user.avatarUrl,
    specialization: d.specialization,
    alreadyLinked: d.clinicDoctors.some((cd) => cd.isActive),
  }));
}

export async function addDoctorToClinic(clinicId: string, input: AddDoctorToClinicInput) {
  if (input.action === "link") {
    const existing = await prisma.clinicDoctor.findUnique({
      where: { clinicId_doctorId: { clinicId, doctorId: input.doctorId } },
    });

    if (existing?.isActive) {
      throw new Error("Doctor is already linked to this clinic");
    }

    if (existing) {
      const updated = await prisma.clinicDoctor.update({
        where: { clinicId_doctorId: { clinicId, doctorId: input.doctorId } },
        data: { isActive: true, leftAt: null },
        include: { doctor: { select: { id: true, name: true, phone: true, specialization: true } } },
      });
      return { clinicDoctor: updated, isNew: false, invitationSent: false };
    }

    const created = await prisma.clinicDoctor.create({
      data: { clinicId, doctorId: input.doctorId },
      include: { doctor: { select: { id: true, name: true, phone: true, specialization: true } } },
    });
    return { clinicDoctor: created, isNew: false, invitationSent: false };
  }

  // action === "create"
  const existingDoctor = await prisma.doctor.findUnique({ where: { phone: input.phone } });
  if (existingDoctor) {
    throw new Error("Doctor with this phone number already exists. Use link instead.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        phone: input.phone,
        name: input.name,
        passwordHash: "",
        role: "DOCTOR",
      },
    });

    const doctor = await tx.doctor.create({
      data: {
        userId: user.id,
        phone: input.phone,
        name: input.name,
        specialization: input.specialization,
      },
    });

    const clinicDoctor = await tx.clinicDoctor.create({
      data: { clinicId, doctorId: doctor.id },
      include: { doctor: { select: { id: true, name: true, phone: true, specialization: true } } },
    });

    return clinicDoctor;
  });

  await notificationService.sendSms(
    input.phone,
    `You have been added to a clinic on MediSync. Visit ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/set-password?phone=${encodeURIComponent(input.phone)} to set your password and start using the app.`
  );

  return { clinicDoctor: result, isNew: true, invitationSent: true };
}

export async function listDoctorsInClinic(clinicId: string) {
  const clinicDoctors = await prisma.clinicDoctor.findMany({
    where: { clinicId, isActive: true },
    include: {
      doctor: {
        include: { user: { select: { avatarUrl: true } } },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return clinicDoctors.map((cd) => ({
    id: cd.doctor.id,
    name: cd.doctor.name,
    phone: cd.doctor.phone,
    specialization: cd.doctor.specialization,
    avatarUrl: cd.doctor.user.avatarUrl,
    role: cd.role,
    isActive: cd.isActive,
    joinedAt: cd.joinedAt,
  }));
}

export async function updateDoctorInClinic(
  clinicId: string,
  doctorId: string,
  input: UpdateDoctorInClinicInput
) {
  const clinicDoctor = await prisma.clinicDoctor.findUnique({
    where: { clinicId_doctorId: { clinicId, doctorId } },
  });
  if (!clinicDoctor) throw new Error("Doctor not found in clinic");

  const updates: Record<string, unknown> = {};
  if (input.role) updates.role = input.role;

  if (Object.keys(updates).length > 0) {
    await prisma.clinicDoctor.update({
      where: { clinicId_doctorId: { clinicId, doctorId } },
      data: updates,
    });
  }

  const doctorUpdates: Record<string, unknown> = {};
  if (input.specialization !== undefined) doctorUpdates.specialization = input.specialization;
  if (input.licenseNumber !== undefined) doctorUpdates.licenseNumber = input.licenseNumber;
  if (input.bio !== undefined) doctorUpdates.bio = input.bio;

  if (Object.keys(doctorUpdates).length > 0) {
    await prisma.doctor.update({ where: { id: doctorId }, data: doctorUpdates });
  }

  return { updated: true };
}

export async function updateDoctorProfile(userId: string, input: UpdateDoctorProfileInput) {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error("Doctor profile not found");

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.specialization !== undefined) updates.specialization = input.specialization;
  if (input.licenseNumber !== undefined) updates.licenseNumber = input.licenseNumber;
  if (input.bio !== undefined) updates.bio = input.bio;

  const updated = await prisma.doctor.update({ where: { id: doctor.id }, data: updates });

  if (input.name) {
    await prisma.user.update({ where: { id: userId }, data: { name: input.name } });
  }

  return updated;
}

export async function removeDoctorFromClinic(clinicId: string, doctorId: string) {
  const clinicDoctor = await prisma.clinicDoctor.findUnique({
    where: { clinicId_doctorId: { clinicId, doctorId } },
  });

  if (!clinicDoctor) throw new Error("Doctor not found in clinic");

  await prisma.clinicDoctor.update({
    where: { clinicId_doctorId: { clinicId, doctorId } },
    data: { isActive: false, leftAt: new Date() },
  });
}
