import { prisma } from "@/lib/prisma";

export async function getPatientDashboard(userId: string) {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    include: {
      clinicPatients: {
        include: {
          clinic: { select: { id: true, name: true, logoUrl: true } },
        },
      },
    },
  });

  if (!patient) return null;

  const today = new Date();

  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      patientId: patient.id,
      date: { gte: today },
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
    },
    include: {
      clinic: { select: { name: true } },
      doctor: { select: { name: true } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 5,
  });

  const clinicsWithVisits = await Promise.all(
    patient.clinicPatients.map(async (cp) => {
      const visitCount = await prisma.medicalRecord.count({
        where: { clinicId: cp.clinicId, patientId: patient.id },
      });
      const lastRecord = await prisma.medicalRecord.findFirst({
        where: { clinicId: cp.clinicId, patientId: patient.id },
        orderBy: { visitDate: "desc" },
      });
      return {
        id: cp.clinic.id,
        name: cp.clinic.name,
        logoUrl: cp.clinic.logoUrl,
        visitCount,
        lastVisit: lastRecord?.visitDate ?? null,
      };
    })
  );

  return {
    patient: { id: patient.id, name: patient.name },
    clinics: clinicsWithVisits,
    upcomingAppointments: upcomingAppointments.map((a) => ({
      id: a.id,
      date: a.date,
      startTime: a.startTime,
      clinicName: a.clinic.name,
      doctorName: a.doctor.name,
      status: a.status,
    })),
  };
}

export async function getPatientClinicRecords(
  userId: string,
  clinicId: string,
  page = 1,
  pageSize = 10
) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;

  const clinicPatient = await prisma.clinicPatient.findUnique({
    where: { clinicId_patientId: { clinicId, patientId: patient.id } },
  });
  if (!clinicPatient) return null;

  const skip = (page - 1) * pageSize;

  const [total, records] = await Promise.all([
    prisma.medicalRecord.count({ where: { clinicId, patientId: patient.id } }),
    prisma.medicalRecord.findMany({
      where: { clinicId, patientId: patient.id },
      include: {
        doctor: { select: { name: true } },
        fileAttachments: { select: { id: true, fileName: true, fileUrl: true, fileType: true } },
      },
      orderBy: { visitDate: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return { records, total, page, pageSize };
}

export async function getPatientAllRecords(
  userId: string,
  page = 1,
  pageSize = 10
) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;

  const skip = (page - 1) * pageSize;

  const [total, records] = await Promise.all([
    prisma.medicalRecord.count({ where: { patientId: patient.id } }),
    prisma.medicalRecord.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: { select: { name: true } },
        clinic: { select: { id: true, name: true } },
        fileAttachments: { select: { id: true, fileName: true, fileUrl: true, fileType: true } },
      },
      orderBy: { visitDate: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return { records, total, page, pageSize };
}
