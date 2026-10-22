import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDoctorDashboard } from "@/lib/services/doctor-dashboard.service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clinicId = request.nextUrl.searchParams.get("clinicId") ?? undefined;
  const data = await getDoctorDashboard(session.user.id, clinicId);

  if (!data) {
    return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
