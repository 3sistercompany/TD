import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

export const runtime = 'edge';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; verified: boolean }>();

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email: string, otp: string) => {
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #b23028 0%, #8b1f1a 100%); background-color: #b23028; padding: 30px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 28px; font-weight: 700; color: #ffffff;">تي دي للخدمات اللوجستية</h1>
              <p style="margin: 0; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 14px; color: rgba(255, 255, 255, 0.9);">رمز التحقق</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; direction: rtl; text-align: right;">
              <h2 style="margin: 0 0 20px 0; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 22px; font-weight: 700; color: #1f2937;">رمز التحقق الخاص بك</h2>
              <p style="margin: 0 0 25px 0; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 16px; line-height: 1.8; color: #4b5563;">
                استخدم الرمز التالي لتغيير كلمة المرور الخاصة بك:
              </p>
              <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-family: 'Cairo', monospace; font-size: 36px; font-weight: 700; color: #b23028; letter-spacing: 8px;">${otp}</span>
              </div>
              <p style="margin: 25px 0 0 0; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 14px; color: #6b7280;">
                هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.
              </p>
              <p style="margin: 10px 0 0 0; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 14px; color: #6b7280;">
                إذا لم تطلب تغيير كلمة المرور، يرجى تجاهل هذا البريد.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 20px; text-align: center;">
              <p style="margin: 0; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} تي دي للخدمات اللوجستية. جميع الحقوق محفوظة.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"تي دي للخدمات اللوجستية" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🔐 رمز التحقق - تي دي للخدمات اللوجستية',
    html,
  });
};

interface AdminUser {
  id: number;
  email: string;
  password_hash: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, otp, newPassword } = body;

    if (!action || !email) {
      return NextResponse.json(
        { error: 'البيانات غير مكتملة' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Hardcoded admin email
    const ADMIN_EMAIL = 'info@tdlogistics.co';
    
    // Only allow the hardcoded admin email
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير مسجل' },
        { status: 404, headers: securityHeaders }
      );
    }

    // Verify admin exists in users table
    const admin = await queryOne<AdminUser>(
      'SELECT id, email, password_hash FROM users WHERE email = ? AND role = ?',
      [email, 'admin']
    );

    if (!admin) {
      // Try to find in admin_users table as fallback
      const adminUser = await queryOne<AdminUser>(
        'SELECT id, email, password_hash FROM admin_users WHERE email = ?',
        [email]
      );
      
      if (!adminUser) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني غير مسجل' },
          { status: 404, headers: securityHeaders }
        );
      }
    }

    switch (action) {
      case 'request': {
        // Generate and store OTP
        const newOTP = generateOTP();
        otpStore.set(email, {
          otp: newOTP,
          expires: Date.now() + 10 * 60 * 1000, // 10 minutes
          verified: false,
        });

        // Send OTP email
        await sendOTPEmail(email, newOTP);

        return NextResponse.json(
          { message: 'تم إرسال رمز التحقق' },
          { headers: securityHeaders }
        );
      }

      case 'verify': {
        if (!otp) {
          return NextResponse.json(
            { error: 'رمز التحقق مطلوب' },
            { status: 400, headers: securityHeaders }
          );
        }

        const stored = otpStore.get(email);
        if (!stored) {
          return NextResponse.json(
            { error: 'لم يتم طلب رمز تحقق. يرجى طلب رمز جديد' },
            { status: 400, headers: securityHeaders }
          );
        }

        if (Date.now() > stored.expires) {
          otpStore.delete(email);
          return NextResponse.json(
            { error: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد' },
            { status: 400, headers: securityHeaders }
          );
        }

        if (stored.otp !== otp) {
          return NextResponse.json(
            { error: 'رمز التحقق غير صحيح' },
            { status: 400, headers: securityHeaders }
          );
        }

        // Mark as verified
        stored.verified = true;
        otpStore.set(email, stored);

        return NextResponse.json(
          { message: 'تم التحقق بنجاح' },
          { headers: securityHeaders }
        );
      }

      case 'changePassword': {
        if (!otp || !newPassword) {
          return NextResponse.json(
            { error: 'البيانات غير مكتملة' },
            { status: 400, headers: securityHeaders }
          );
        }

        const stored = otpStore.get(email);
        if (!stored || !stored.verified) {
          return NextResponse.json(
            { error: 'يرجى التحقق من رمز OTP أولاً' },
            { status: 400, headers: securityHeaders }
          );
        }

        if (Date.now() > stored.expires) {
          otpStore.delete(email);
          return NextResponse.json(
            { error: 'انتهت صلاحية الجلسة. يرجى البدء من جديد' },
            { status: 400, headers: securityHeaders }
          );
        }

        if (stored.otp !== otp) {
          return NextResponse.json(
            { error: 'رمز التحقق غير صحيح' },
            { status: 400, headers: securityHeaders }
          );
        }

        // Hash new password and update
        const passwordHash = await bcrypt.hash(newPassword, 12);
        
        // Try to update in users table first
        await execute(
          'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ? AND role = ?',
          [passwordHash, email, 'admin']
        );
        
        // Also try admin_users table as fallback
        await execute(
          'UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
          [passwordHash, email]
        );

        // Clear OTP
        otpStore.delete(email);

        return NextResponse.json(
          { message: 'تم تغيير كلمة المرور بنجاح' },
          { headers: securityHeaders }
        );
      }

      default:
        return NextResponse.json(
          { error: 'إجراء غير معروف' },
          { status: 400, headers: securityHeaders }
        );
    }
  } catch (error) {
    console.error('OTP API error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500, headers: securityHeaders }
    );
  }
}
