import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { execute } from '@/lib/db';

export const runtime = 'edge';

const careersSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(9).max(15),
  position: z.string().min(1).max(100),
  message: z.string().max(2000).optional(),
  language: z.enum(['ar', 'en']).optional(),
});

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, max-age=0',
};

// Edge-compatible: emails are logged, data is saved to DB
const sendCareerEmails = async (data: { name: string; email: string; phone: string; position: string; message: string | null }, isArabic: boolean) => {
  console.log('[Edge Email] Career application confirmation would be sent to:', data.email);
  console.log('[Edge Email] Career admin notification for:', data.name, '-', data.position);
};

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const rateLimitKey = getRateLimitKey(ip, 'careers');
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.contact);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد المسموح. يرجى المحاولة بعد بضع دقائق.' },
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

    const validation = careersSchema.safeParse(body);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400, headers: securityHeaders }
      );
    }

    const data = validation.data;

    const sanitizedData = {
      name: sanitizeInput(data.name),
      email: sanitizeEmail(data.email),
      phone: sanitizePhone(data.phone),
      position: sanitizeInput(data.position),
      message: data.message ? sanitizeInput(data.message) : null,
    };

    if (!sanitizedData.email || !sanitizedData.phone) {
      return NextResponse.json(
        { error: 'بيانات التواصل غير صالحة' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Insert into database
    await execute(
      `INSERT INTO career_applications 
       (name, email, phone, position, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        sanitizedData.name,
        sanitizedData.email,
        sanitizedData.phone,
        sanitizedData.position,
        sanitizedData.message,
      ]
    );

    const language = body.language === 'en' ? 'en' : 'ar';
    const isArabic = language === 'ar';

    // Send confirmation emails (edge-compatible - just logs for now)
    try {
      await sendCareerEmails(sanitizedData, isArabic);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return NextResponse.json(
      { success: true, message: 'تم إرسال طلبك بنجاح' },
      { status: 200, headers: securityHeaders }
    );

  } catch (error) {
    console.error('Career application error:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.' },
      { status: 500, headers: securityHeaders }
    );
  }
}
