import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClinicSchema } from "@/lib/validations/clinic";
import { createClinic, listClinicsForUser } from "@/lib/services/clinic.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clinics = await listClinicsForUser(session.user.id);
  return NextResponse.json({ clinics });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
  if (user.role !== "CLINIC_ADMIN") {
    return NextResponse.json({ error: "Forbidden: CLINIC_ADMIN role required" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createClinicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const clinic = await createClinic(session.user.id, parsed.data);
  return NextResponse.json({ clinic }, { status: 201 });
}
