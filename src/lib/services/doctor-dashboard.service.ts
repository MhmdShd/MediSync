import { prisma } from "@/lib/prisma";

export async function getDoctorDashboard(userId: string, clinicId?: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    include: {
      clinicDoctors: {
        where: { isActive: true },
        include: { clinic: { select: { id: true, name: true, logoUrl: true } } },
      },
    },
  });

  if (!doctor) return null;

  const clinicFilter = clinicId ? { clinicId } : { clinicId: { in: doctor.clinicDoctors.map((cd) => cd.clinicId) } };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayAppointments, totalPatients, totalAppointments, thisWeekCount] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        ...clinicFilter,
        date: { gte: today, lt: tomorrow },
        status: { notIn: ["CANCELLED"] },
      },
      include: {
        patient: { select: { name: true } },
        clinic: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.clinicPatient.count({
      where: {
        clinicId: clinicId
          ? clinicId
          : { in: doctor.clinicDoctors.map((cd) => cd.clinicId) },
      },
    }),
    prisma.appointment.count({
      where: { doctorId: doctor.id, ...clinicFilter, status: "COMPLETED" },
    }),
    prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        ...clinicFilter,
        date: {
          gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: tomorrow,
        },
      },
    }),
  ]);

  return {
    doctor: { id: doctor.id, name: doctor.name, specialization: doctor.specialization },
    clinics: doctor.clinicDoctors.map((cd) => cd.clinic),
    todayAppointments: todayAppointments.map((a) => ({
      id: a.id,
      patientName: a.patient.name,
      clinicName: a.clinic.name,
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
    })),
    stats: {
      totalPatients,
      totalAppointments,
      thisWeekAppointments: thisWeekCount,
      completedToday: todayAppointments.filter((a) => a.status === "COMPLETED").length,
    },
  };
}

export async function getDoctorPatients(userId: string, clinicId: string, page = 1, pageSize = 20) {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) return { patients: [], total: 0, page, pageSize };

  const skip = (page - 1) * pageSize;

  const [total, clinicPatients] = await Promise.all([
    prisma.clinicPatient.count({ where: { clinicId } }),
    prisma.clinicPatient.findMany({
      where: { clinicId },
      include: {
        patient: {
          include: {
            appointments: {
              where: { clinicId, doctorId: doctor.id, status: "COMPLETED" },
              orderBy: { date: "desc" },
              take: 1,
            },
          },
        },
      },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    patients: clinicPatients.map((cp) => ({
      id: cp.patient.id,
      name: cp.patient.name,
      phone: cp.patient.phone,
      lastVisit: cp.patient.appointments[0]?.date ?? null,
    })),
    total,
    page,
    pageSize,
  };
}
