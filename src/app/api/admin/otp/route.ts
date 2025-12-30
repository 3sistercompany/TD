import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

export const runtime = 'edge';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; verified: boolean }>();

// Generate 6-digit OTP using Web Crypto API (edge-compatible)
const generateOTP = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
};

// Edge-compatible: log OTP email (in production, use Resend/SendGrid API)
const sendOTPEmail = async (email: string, otp: string) => {
  console.log(`[Edge Email] OTP ${otp} would be sent to: ${email}`);
  // In production, use fetch to call Resend/SendGrid API
  return Promise.resolve();
};

// Edge-compatible password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

        // Hash new password and update (using edge-compatible hashing)
        const passwordHash = await hashPassword(newPassword);
        
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
