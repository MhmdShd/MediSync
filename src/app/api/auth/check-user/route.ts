import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const checkUserSchema = z.object({
  phone: z.string().optional(),
  identifier: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = checkUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { phone, identifier } = parsed.data;
  const lookup = phone || identifier;
  if (!lookup) {
    return NextResponse.json({ exists: false, needsPassword: false });
  }

  const isPhone = lookup.startsWith("+");
  const user = isPhone
    ? await prisma.user.findUnique({ where: { phone: lookup } })
    : await prisma.user.findUnique({ where: { username: lookup } });

  if (!user || !user.isActive) {
    return NextResponse.json({ exists: false, needsPassword: false });
  }

  return NextResponse.json({
    exists: true,
    needsPassword: user.passwordHash === "",
  });
}
