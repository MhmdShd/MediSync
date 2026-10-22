import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addDoctorToClinic, listDoctorsInClinic } from "@/lib/services/doctor.service";
import { addDoctorToClinicSchema } from "@/lib/validations/doctor";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId } = await params;
  const doctors = await listDoctorsInClinic(clinicId);
  return NextResponse.json({ doctors });
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
  const parsed = addDoctorToClinicSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const result = await addDoctorToClinic(clinicId, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
