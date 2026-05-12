import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { parse } from 'cookie';

export async function GET(req: NextRequest) {
  try {
    const cookies = parse(req.headers.get('cookie') || '');
    const token = cookies['auth_token'];

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: { id: payload.id, codename: payload.codename, email: payload.email },
    });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}