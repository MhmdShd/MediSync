import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setDoctorSchedule } from "@/lib/services/appointment.service";
import { setScheduleSchema } from "@/lib/validations/appointment";
import { prisma } from "@/lib/prisma";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; doctorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId, doctorId } = await params;

  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId, clinicId },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({
    schedules: schedules.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      day: DAY_NAMES[s.dayOfWeek],
      startTime: s.startTime,
      endTime: s.endTime,
      slotDurationMinutes: s.slotDurationMinutes,
      isActive: s.isActive,
    })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; doctorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId, doctorId } = await params;
  const body = await request.json();
  const parsed = setScheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const schedules = await setDoctorSchedule(clinicId, doctorId, parsed.data);
  return NextResponse.json({ schedules });
}
