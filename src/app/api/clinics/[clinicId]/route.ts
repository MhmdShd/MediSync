import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateClinicSchema } from "@/lib/validations/clinic";
import { getClinicById, updateClinic } from "@/lib/services/clinic.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId } = await params;
  const clinic = await getClinicById(clinicId);

  if (!clinic) {
    return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
  }

  const user = session.user as { id: string };
  return NextResponse.json({
    clinic: {
      ...clinic,
      doctorCount: clinic._count.clinicDoctors,
      patientCount: clinic._count.clinicPatients,
      isOwner: clinic.ownerId === user.id,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId } = await params;
  const body = await request.json();
  const parsed = updateClinicSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const clinic = await updateClinic(clinicId, session.user.id, parsed.data);
    return NextResponse.json({ clinic });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("Forbidden")) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
