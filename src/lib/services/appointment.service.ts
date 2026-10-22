import { prisma } from "@/lib/prisma";
import { notificationService } from "./notification.service";
import { generateTimeSlots } from "@/lib/utils/date";
import type { BookAppointmentInput, SetScheduleInput } from "@/lib/validations/appointment";
import type { TimeSlot } from "@/types";
import type { AppointmentStatus } from "@prisma/client";

export async function getAvailableSlots(
  clinicId: string,
  doctorId: string,
  dateStr: string
): Promise<TimeSlot[]> {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();

  const schedule = await prisma.doctorSchedule.findUnique({
    where: { doctorId_clinicId_dayOfWeek: { doctorId, clinicId, dayOfWeek } },
  });

  if (!schedule || !schedule.isActive) return [];

  const allSlots = generateTimeSlots(
    schedule.startTime,
    schedule.endTime,
    schedule.slotDurationMinutes
  );

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      clinicId,
      date,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
    },
    select: { startTime: true },
  });

  const bookedTimes = new Set(bookedAppointments.map((a) => a.startTime));

  return allSlots.map((slot) => ({
    ...slot,
    available: !bookedTimes.has(slot.startTime),
  }));
}

export async function bookAppointment(clinicId: string, input: BookAppointmentInput) {
  const existing = await prisma.appointment.findUnique({
    where: {
      doctorId_clinicId_date_startTime: {
        doctorId: input.doctorId,
        clinicId,
        date: new Date(input.date),
        startTime: input.startTime,
      },
    },
  });

  if (existing && existing.status !== "CANCELLED" && existing.status !== "NO_SHOW") {
    throw new Error("This time slot is already booked");
  }

  const appointment = await prisma.appointment.create({
    data: {
      clinicId,
      doctorId: input.doctorId,
      patientId: input.patientId,
      date: new Date(input.date),
      startTime: input.startTime,
      endTime: input.endTime,
      notes: input.notes,
    },
    include: {
      patient: { select: { phone: true, name: true } },
      doctor: { select: { name: true } },
      clinic: { select: { name: true } },
    },
  });

  await notificationService.sendSms(
    appointment.patient.phone,
    `Appointment confirmed at ${appointment.clinic.name} with ${appointment.doctor.name} on ${input.date} at ${input.startTime}.`
  );

  return appointment;
}

export async function cancelAppointment(
  clinicId: string,
  appointmentId: string,
  reason?: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { phone: true, name: true } },
      doctor: { select: { name: true } },
      clinic: { select: { name: true } },
    },
  });

  if (!appointment) throw new Error("Appointment not found");
  if (appointment.clinicId !== clinicId) throw new Error("Forbidden");
  if (appointment.status === "CANCELLED") throw new Error("Appointment already cancelled");

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancelReason: reason },
  });

  await notificationService.sendSms(
    appointment.patient.phone,
    `Your appointment at ${appointment.clinic.name} has been cancelled.`
  );

  return updated;
}

export async function updateAppointmentStatus(
  clinicId: string,
  appointmentId: string,
  status: string,
  cancelReason?: string
) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment || appointment.clinicId !== clinicId) {
    throw new Error("Appointment not found");
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: status as Parameters<typeof prisma.appointment.update>[0]["data"]["status"], cancelReason },
  });
}

export async function listAppointments(
  clinicId: string,
  filters: {
    date?: string;
    doctorId?: string;
    patientId?: string;
    status?: string;
    page: number;
    pageSize: number;
  }
) {
  const { date, doctorId, patientId, status, page, pageSize } = filters;
  const skip = (page - 1) * pageSize;

  const where = {
    clinicId,
    ...(date ? { date: new Date(date) } : {}),
    ...(doctorId ? { doctorId } : {}),
    ...(patientId ? { patientId } : {}),
    ...(status ? { status: status as AppointmentStatus } : {}),
  };

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      skip,
      take: pageSize,
    }),
  ]);

  return { appointments, total, page, pageSize };
}

export async function setDoctorSchedule(
  clinicId: string,
  doctorId: string,
  input: SetScheduleInput
) {
  const schedules = await Promise.all(
    input.schedules.map((s) =>
      prisma.doctorSchedule.upsert({
        where: {
          doctorId_clinicId_dayOfWeek: { doctorId, clinicId, dayOfWeek: s.dayOfWeek },
        },
        update: {
          startTime: s.startTime,
          endTime: s.endTime,
          slotDurationMinutes: s.slotDurationMinutes,
          isActive: true,
        },
        create: {
          doctorId,
          clinicId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          slotDurationMinutes: s.slotDurationMinutes,
        },
      })
    )
  );
  return schedules;
}
