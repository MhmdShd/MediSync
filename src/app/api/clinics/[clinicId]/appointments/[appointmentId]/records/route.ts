import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createMedicalRecord } from "@/lib/services/medical-record.service";
import { createMedicalRecordSchema } from "@/lib/validations/appointment";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; appointmentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId, appointmentId } = await params;
  const body = await request.json();
  const parsed = createMedicalRecordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  // Doctor can create records directly; clinic admin uses appointment's doctor
  let doctorId: string;
  const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
  if (doctor) {
    doctorId = doctor.id;
  } else {
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    doctorId = appointment.doctorId;
  }

  try {
    const record = await createMedicalRecord(appointmentId, clinicId, doctorId, parsed.data);
    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
