import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeDoctorFromClinic, updateDoctorInClinic } from "@/lib/services/doctor.service";
import { updateDoctorInClinicSchema } from "@/lib/validations/doctor";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; doctorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId, doctorId } = await params;
  const body = await request.json();
  const parsed = updateDoctorInClinicSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const result = await updateDoctorInClinic(clinicId, doctorId, parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; doctorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId, doctorId } = await params;

  try {
    await removeDoctorFromClinic(clinicId, doctorId);
    return NextResponse.json({ message: "Doctor removed from clinic" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
