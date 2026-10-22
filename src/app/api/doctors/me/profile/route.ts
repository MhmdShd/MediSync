import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateDoctorProfile } from "@/lib/services/doctor.service";
import { updateDoctorProfileSchema } from "@/lib/validations/doctor";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { phone: true, username: true, email: true, avatarUrl: true } } },
  });

  if (!doctor) {
    return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    doctor: {
      id: doctor.id,
      name: doctor.name,
      phone: doctor.user.phone,
      username: doctor.user.username,
      email: doctor.user.email,
      avatarUrl: doctor.user.avatarUrl,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      bio: doctor.bio,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateDoctorProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const doctor = await updateDoctorProfile(session.user.id, parsed.data);
    return NextResponse.json({ doctor });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
