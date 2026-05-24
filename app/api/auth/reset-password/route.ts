import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // Not expired
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    // Update password and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}