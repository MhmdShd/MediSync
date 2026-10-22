import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPatientDashboard } from "@/lib/services/patient-dashboard.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getPatientDashboard(session.user.id);
  if (!data) {
    return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
