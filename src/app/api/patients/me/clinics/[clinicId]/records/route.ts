import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPatientClinicRecords } from "@/lib/services/patient-dashboard.service";
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

  const data = await getPatientClinicRecords(session.user.id, clinicId, page, pageSize);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
