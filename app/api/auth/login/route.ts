import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Wrong identity or secret.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json({ error: 'Wrong identity or secret.' }, { status: 401 });
    }

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
      { status: 200, headers: { 'Set-Cookie': cookie } }
    );
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}