import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { codename, email, password } = await req.json();

    if (!codename || !email || !password) {
      return NextResponse.json({ error: 'All fields required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { codename: codename.toUpperCase() }] },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email or codename already taken.' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        codename: codename.toUpperCase().replace(/\s+/g, '_'),
        email,
        password: hashed,
      },
    });

    const token = signToken({ id: user.id, codename: user.codename, email: user.email });

    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(
      { id: user.id, codename: user.codename, email: user.email },
      { status: 201, headers: { 'Set-Cookie': cookie } }
    );
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}