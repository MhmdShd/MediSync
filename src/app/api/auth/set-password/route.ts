import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { passwordSchema } from "@/lib/validations/shared";

const setPasswordSchema = z.object({
  phone: z.string(),
  password: passwordSchema,
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = setPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { phone, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.passwordHash !== "") {
    return NextResponse.json({ error: "Password already set" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.update({
    where: { phone },
    data: { passwordHash },
  });

  return NextResponse.json({ message: "Password set successfully" });
}
