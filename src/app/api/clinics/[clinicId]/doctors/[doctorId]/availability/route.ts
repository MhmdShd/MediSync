import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/services/appointment.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; doctorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId, doctorId } = await params;
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date parameter required (YYYY-MM-DD)" }, { status: 400 });
  }

  const slots = await getAvailableSlots(clinicId, doctorId, date);
  return NextResponse.json({ doctorId, clinicId, date, slots });
}
