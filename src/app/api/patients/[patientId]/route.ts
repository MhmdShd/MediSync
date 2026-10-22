import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updatePatient } from "@/lib/services/patient.service";
import { updatePatientSchema } from "@/lib/validations/patient";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { patientId } = await params;
  const body = await request.json();
  const parsed = updatePatientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const patient = await updatePatient(patientId, parsed.data);
    return NextResponse.json({ patient });
  } catch (err) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }
}
