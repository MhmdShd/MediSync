import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPatientInClinicContext } from "@/lib/services/patient.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; patientId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId, patientId } = await params;
  const result = await getPatientInClinicContext(clinicId, patientId);

  if (!result) {
    return NextResponse.json({ error: "Patient not found in this clinic" }, { status: 404 });
  }

  return NextResponse.json(result);
}
