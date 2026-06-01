import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const decoded = verifyToken(token) as { id: string } | null;
    if (!decoded?.id)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { codename } = await req.json();
    if (!codename?.trim())
      return NextResponse.json({ error: 'Codename required' }, { status: 400 });
    if (codename.trim().length < 3)
      return NextResponse.json(
        { error: 'Codename must be at least 3 characters' },
        { status: 400 },
      );
    if (codename.trim().length > 20)
      return NextResponse.json(
        { error: 'Codename must be under 20 characters' },
        { status: 400 },
      );

    // Check uniqueness
    const existing = await prisma.user.findUnique({
      where: { codename: codename.trim() },
    });
    if (existing && existing.id !== decoded.id) {
      return NextResponse.json(
        { error: 'Codename already taken' },
        { status: 409 },
      );
    }

    const updated = await prisma.user.update({
      where: { id: decoded.id },
      data: { codename: codename.trim() },
      select: {
        id: true,
        codename: true,
        email: true,
        isPremium: true,
        premiumSince: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error('Update codename error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
