import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); 

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    // Dynamically detect the environment base URL via headers
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = host ? `${protocol}://${host}` : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"QuestBoard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your QuestBoard password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fefae0; border: 4px solid black; border-radius: 16px;">
          <h1 style="font-size: 32px; text-transform: uppercase; margin-bottom: 8px;">Password Reset</h1>
          <p style="opacity: 0.6; margin-bottom: 24px;">A reset was requested for your QuestBoard account.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #d4a373; color: black; border: 4px solid black; padding: 16px 32px; border-radius: 12px; text-transform: uppercase; font-weight: bold; text-decoration: none; box-shadow: 4px 4px 0 black;">
            Reset Password
          </a>
          <p style="margin-top: 24px; opacity: 0.4; font-size: 12px; text-transform: uppercase;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}