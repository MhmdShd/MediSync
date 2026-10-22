import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateAppointmentStatus, cancelAppointment } from "@/lib/services/appointment.service";
import { updateAppointmentSchema, cancelAppointmentSchema } from "@/lib/validations/appointment";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; appointmentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId, appointmentId } = await params;
  const body = await request.json();
  const parsed = updateAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const appointment = await updateAppointmentStatus(
      clinicId,
      appointmentId,
      parsed.data.status,
      parsed.data.cancelReason
    );
    return NextResponse.json({ appointment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; appointmentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId, appointmentId } = await params;
  const body = await request.json().catch(() => ({}));
  const { reason } = cancelAppointmentSchema.parse(body);

  try {
    await cancelAppointment(clinicId, appointmentId, reason);
    return NextResponse.json({ message: "Appointment cancelled" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
