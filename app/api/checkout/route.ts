// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // ── 1. Authenticate user from cookie ────────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const decoded = verifyToken(token) as { id: string } | null;
    if (!decoded?.id) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, isPremium: true },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (user.isPremium) {
      return NextResponse.redirect(new URL('/premium', req.url));
    }

    // ── 2. Call Polar API to create a checkout session ───────────────────────
    const productId = process.env.POLAR_PRODUCT_ID;
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    const successUrl = process.env.POLAR_SUCCESS_URL ?? `${req.nextUrl.origin}/premium?success=1`;

    if (!productId || !accessToken) {
      console.error('Missing POLAR_PRODUCT_ID or POLAR_ACCESS_TOKEN');
      return NextResponse.redirect(new URL('/premium?error=config', req.url));
    }

    const body = {
      product_id: productId,
      success_url: successUrl,
      // Pre-fill customer email
      customer_email: user.email ?? undefined,
      // Pass userId in metadata — webhook reads this to update DB
      metadata: {
        userId: user.id,
        email: user.email ?? '',
      },
    };

    const polarRes = await fetch('https://api.polar.sh/v1/checkouts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!polarRes.ok) {
      const err = await polarRes.text();
      console.error('Polar checkout creation failed:', err);
      return NextResponse.redirect(new URL('/premium?error=polar', req.url));
    }

    const checkout = await polarRes.json();
    const checkoutUrl = checkout.url;

    if (!checkoutUrl) {
      console.error('No checkout URL in Polar response:', checkout);
      return NextResponse.redirect(new URL('/premium?error=no_url', req.url));
    }

    // ── 3. Redirect user to Polar hosted checkout ────────────────────────────
    return NextResponse.redirect(checkoutUrl);
  } catch (err) {
    console.error('Checkout route error:', err);
    return NextResponse.redirect(new URL('/premium?error=unknown', req.url));
  }
}