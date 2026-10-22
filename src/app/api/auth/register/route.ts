import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { phone, username, password, name, role, clinicName, clinicAddress, clinicPhone } = parsed.data;

  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone) {
    return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
  }

  if (username) {
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
  }

  const passwordHash = await hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { phone, username: username || null, passwordHash, name, role },
    });

    // If registering as clinic admin, create their clinic too
    if (role === "CLINIC_ADMIN" && clinicName) {
      await tx.clinic.create({
        data: {
          name: clinicName,
          address: clinicAddress || "",
          phone: clinicPhone || phone,
          ownerId: user.id,
          timezone: "Asia/Baghdad",
          operatingHours: {
            mon: { open: "09:00", close: "17:00" },
            tue: { open: "09:00", close: "17:00" },
            wed: { open: "09:00", close: "17:00" },
            thu: { open: "09:00", close: "17:00" },
            sat: { open: "09:00", close: "13:00" },
          },
        },
      });
    }

    return user;
  });

  return NextResponse.json(
    { user: { id: result.id, phone: result.phone, name: result.name, role: result.role } },
    { status: 201 }
  );
}
