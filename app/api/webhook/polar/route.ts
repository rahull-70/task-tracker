// app/api/webhooks/polar/route.ts
import { NextResponse } from 'next/server';
import { validateEvent } from '@polar-sh/sdk/webhooks';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const requestBody = await request.text();
  const signature = request.headers.get('webhook-signature') ?? '';

  // ── Verify the webhook is genuinely from Polar ──────────────────────────────
  let event;
  try {
    event = validateEvent(
      requestBody,
      { 'webhook-signature': signature },
      process.env.POLAR_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('Invalid Polar webhook signature:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 },
    );
  }

  console.log('Polar event received:', event.type);

  // ── Handle subscription.created and subscription.updated ───────────────────
  if (
    event.type === 'subscription.created' ||
    event.type === 'subscription.updated'
  ) {
    const subscription = event.data;
    const userId = subscription.metadata?.userId as string | undefined;
    const isActive = subscription.status === 'active';

    if (!userId) {
      console.warn('No userId in subscription metadata — cannot update user');
      return NextResponse.json({ received: true });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: isActive,
        premiumSince: isActive ? new Date() : null,
      },
    });

    console.log(`✅ User ${userId} premium set to: ${isActive}`);
  }

  // ── Handle subscription.revoked (hard cancel / payment failed) ─────────────
  if (event.type === 'subscription.revoked') {
    const subscription = event.data;
    const userId = subscription.metadata?.userId as string | undefined;

    if (!userId) {
      console.warn('No userId in revoked subscription metadata');
      return NextResponse.json({ received: true });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
        premiumSince: null,
      },
    });

    console.log(`❌ Premium revoked for user: ${userId}`);
  }

  // ── Handle subscription.canceled ───────────────────────────────────────────
  if (event.type === 'subscription.canceled') {
    const subscription = event.data;
    const userId = subscription.metadata?.userId as string | undefined;

    if (!userId) return NextResponse.json({ received: true });

    // Polar cancels at period end — only remove premium when actually ended
    const isStillActive = subscription.status === 'active';
    if (!isStillActive) {
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false, premiumSince: null },
      });
      console.log(`🔴 Premium ended for user: ${userId}`);
    } else {
      console.log(`⚠️ User ${userId} canceled but still active until period end`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}