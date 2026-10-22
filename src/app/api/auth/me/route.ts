import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { usernameSchema } from "@/lib/validations/shared";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, phone: true, username: true, name: true, role: true, avatarUrl: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  username: usernameSchema.optional().nullable(),
  email: z.string().email().optional().nullable(),
});

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = parsed.data;

  if (data.username) {
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.username !== undefined ? { username: data.username || null } : {}),
      ...(data.email !== undefined ? { email: data.email || null } : {}),
    },
    select: { id: true, phone: true, username: true, name: true, role: true, email: true },
  });

  return NextResponse.json({ user });
}
