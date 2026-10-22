import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ScheduleClient } from "./schedule-client";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function DoctorSchedulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
  if (!doctor) redirect("/doctor/dashboard");

  const clinicDoctors = await prisma.clinicDoctor.findMany({
    where: { doctorId: doctor.id },
    include: { clinic: true },
  });

  const clinicsWithSchedules = await Promise.all(
    clinicDoctors.map(async (cd) => {
      const schedules = await prisma.doctorSchedule.findMany({
        where: { doctorId: doctor.id, clinicId: cd.clinicId },
        orderBy: { dayOfWeek: "asc" },
      });

      const scheduleMap: Record<number, { startTime: string; endTime: string; isActive: boolean; slotDurationMinutes: number }> = {};
      for (const s of schedules) {
        scheduleMap[s.dayOfWeek] = {
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
          slotDurationMinutes: s.slotDurationMinutes,
        };
      }

      return {
        clinicId: cd.clinicId,
        clinicName: cd.clinic.name,
        schedules: DAYS.map((day, idx) => ({
          dayOfWeek: idx,
          day,
          startTime: scheduleMap[idx]?.startTime ?? "09:00",
          endTime: scheduleMap[idx]?.endTime ?? "17:00",
          isActive: scheduleMap[idx]?.isActive ?? false,
          slotDurationMinutes: scheduleMap[idx]?.slotDurationMinutes ?? 30,
        })),
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Schedule Management</h1>
        <p className="text-muted-foreground">Set your working hours and availability per clinic</p>
      </div>
      <ScheduleClient doctorId={doctor.id} clinics={clinicsWithSchedules} />
    </div>
  );
}
