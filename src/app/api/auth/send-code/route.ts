import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { setPendingCode } from "@/lib/pendingCodes";

// Detect whether real Gmail SMTP credentials have been configured.
// The repo ships with placeholder values, so we must not attempt to send
// through a misconfigured transport (that would hang / throw).
function smtpConfigured(): boolean {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  return Boolean(
    user &&
      pass &&
      user !== "your-email@gmail.com" &&
      pass !== "your-app-password" &&
      user.includes("@")
  );
}

function buildEmailHtml(code: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #1a1a1a; margin: 0;">Eye Care</h1>
        <p style="color: #666; margin: 5px 0 0;">Premium Eyewear</p>
      </div>
      <div style="background: #f8f8f8; border-radius: 8px; padding: 30px; text-align: center;">
        <h2 style="color: #1a1a1a;">Email Verification</h2>
        <p style="color: #666;">Your verification code is:</p>
        <div style="background: #1a1a1a; color: #fff; font-size: 32px; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; display: inline-block; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
  `;
}

// POST /api/auth/send-code — send 6-digit verification code via email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, password, userData } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store pending verification (DB-backed so it survives restarts)
    await setPendingCode(email, {
      code,
      expiresAt,
      data: JSON.stringify({ name, email, phone, password, userData }),
    });

    const isDev = process.env.NODE_ENV === "development";

    // If SMTP is not configured, we cannot deliver email. In development we
    // surface the code so registration is fully testable; in production we
    // report the misconfiguration explicitly.
    if (!smtpConfigured()) {
      if (isDev) {
        return NextResponse.json({
          message: "Email delivery is not configured. Use the code shown below to continue.",
          code,
          devCode: true,
          expiresIn: 600,
        });
      }
      return NextResponse.json(
        {
          error:
            "Email service is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in the environment.",
        },
        { status: 500 }
      );
    }

    // Send email through configured Gmail SMTP
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Eye Care" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Your Eye Care Verification Code",
        html: buildEmailHtml(code),
      });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      // In development, still return success with code for testing
      if (isDev) {
        return NextResponse.json({
          message: "Code generated (email sending failed in dev)",
          code,
          devCode: true,
          expiresIn: 600,
        });
      }
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Verification code sent",
      expiresIn: 600,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
