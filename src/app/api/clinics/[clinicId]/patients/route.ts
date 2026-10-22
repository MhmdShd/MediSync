import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addPatientToClinic, listPatientsInClinic } from "@/lib/services/patient.service";
import { addPatientToClinicSchema } from "@/lib/validations/patient";
import { paginationSchema } from "@/lib/validations/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId } = await params;
  const { searchParams } = request.nextUrl;

  const { page, pageSize } = paginationSchema.parse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
  const search = searchParams.get("search") ?? undefined;

  const result = await listPatientsInClinic(clinicId, { page, pageSize, search });
  return NextResponse.json(result);
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
  const parsed = addPatientToClinicSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const result = await addPatientToClinic(clinicId, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
