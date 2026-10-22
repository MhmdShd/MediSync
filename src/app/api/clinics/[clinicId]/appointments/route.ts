import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bookAppointment, listAppointments } from "@/lib/services/appointment.service";
import { bookAppointmentSchema } from "@/lib/validations/appointment";
import { paginationSchema } from "@/lib/validations/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clinicId } = await params;
    const sp = request.nextUrl.searchParams;
    const { page, pageSize } = paginationSchema.parse({
      page: sp.get("page") ?? undefined,
      pageSize: sp.get("pageSize") ?? undefined,
    });

    const result = await listAppointments(clinicId, {
      date: sp.get("date") ?? undefined,
      doctorId: sp.get("doctorId") ?? undefined,
      patientId: sp.get("patientId") ?? undefined,
      status: sp.get("status") ?? undefined,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /appointments] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const stack = err instanceof Error ? err.stack : "";
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId } = await params;
  const body = await request.json();
  const parsed = bookAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const appointment = await bookAppointment(clinicId, parsed.data);
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
