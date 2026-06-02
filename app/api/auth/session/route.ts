import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({}, { status: 200 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({}, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        codename: true,
        email: true,
        isPremium: true,      
        premiumSince: true,    
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({}, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        codename: user.codename,
        email: user.email,
        isPremium: user.isPremium ?? false,
        premiumSince: user.premiumSince ?? null,
        createdAt: user.createdAt,
      },
    });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}