import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation/schemas';
import { sanitizeEmail } from '@/lib/security/sanitize';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/security/auth';
import { queryOne, execute } from '@/lib/db';

export const runtime = 'edge';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, max-age=0',
};

interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'customer' | 'partner';
  is_active: number;
  failed_login_attempts: number;
  locked_until: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting for auth
    const rateLimitKey = getRateLimitKey(ip, 'auth');
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.auth);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز عدد المحاولات المسموحة. يرجى المحاولة بعد 15 دقيقة.' },
        { 
          status: 429,
          headers: {
            ...securityHeaders,
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
          }
        }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'بيانات غير صالحة' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Validate
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 400, headers: securityHeaders }
      );
    }

    const { email, password } = validation.data;
    const sanitizedEmail = sanitizeEmail(email);

    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صالح' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Find user
    const user = await queryOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [sanitizedEmail]
    );

    // Generic error message to prevent user enumeration
    const genericError = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';

    if (!user) {
      return NextResponse.json(
        { error: genericError },
        { status: 401, headers: securityHeaders }
      );
    }

    // Check if account is locked
    if (user.locked_until) {
      const lockTime = new Date(user.locked_until);
      if (lockTime > new Date()) {
        return NextResponse.json(
          { error: 'الحساب مقفل مؤقتاً. يرجى المحاولة لاحقاً.' },
          { status: 401, headers: securityHeaders }
        );
      }
    }

    // Check if account is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'الحساب غير مفعل. يرجى التواصل مع الدعم.' },
        { status: 401, headers: securityHeaders }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed attempts
      const newAttempts = user.failed_login_attempts + 1;
      
      if (newAttempts >= 5) {
        // Lock account for 30 minutes
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        await execute(
          'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
          [newAttempts, lockUntil, user.id]
        );
      } else {
        await execute(
          'UPDATE users SET failed_login_attempts = ? WHERE id = ?',
          [newAttempts, user.id]
        );
      }

      return NextResponse.json(
        { error: genericError },
        { status: 401, headers: securityHeaders }
      );
    }

    // Reset failed attempts and update last login
    await execute(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
      { status: 200, headers: securityHeaders }
    );

  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.' },
      { status: 500, headers: securityHeaders }
    );
  }
}
