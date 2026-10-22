import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchDoctorsByPhone } from "@/lib/services/doctor.service";

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
  const phone = searchParams.get("phone") ?? "";

  if (phone.length < 7) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchDoctorsByPhone(clinicId, phone);
  return NextResponse.json({ results });
}
