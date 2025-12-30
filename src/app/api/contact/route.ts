import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation/schemas';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { execute, queryOne } from '@/lib/db';
import { sendContactConfirmation, sendContactAdminNotification, sendNewsletterWelcome } from '@/lib/email';

export const runtime = 'edge';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, max-age=0',
};

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting
    const rateLimitKey = getRateLimitKey(ip, 'contact');
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

    // Parse and validate body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'بيانات غير صالحة' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Validate with Zod schema
    const validation = contactSchema.safeParse(body);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400, headers: securityHeaders }
      );
    }

    const data = validation.data;

    // Additional sanitization
    const sanitizedData = {
      name: sanitizeInput(data.name),
      email: sanitizeEmail(data.email),
      phone: data.phone ? sanitizePhone(data.phone) : null,
      company: data.company ? sanitizeInput(data.company) : null,
      subject: sanitizeInput(data.subject),
      message: sanitizeInput(data.message),
      type: data.type,
    };

    // Validate email was sanitized successfully
    if (!sanitizedData.email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صالح' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Get user agent for logging
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert into database using parameterized query (SQL injection safe)
    await execute(
      `INSERT INTO contact_submissions 
       (name, email, phone, company, subject, message, type, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizedData.name,
        sanitizedData.email,
        sanitizedData.phone,
        sanitizedData.company,
        sanitizedData.subject,
        sanitizedData.message,
        sanitizedData.type,
        ip,
        userAgent.slice(0, 500), // Limit user agent length
      ]
    );

    // Subscribe to newsletter (if not already subscribed)
    const existingSubscriber = await queryOne<{ id: number }>(
      'SELECT id FROM newsletter_subscribers WHERE email = ?',
      [sanitizedData.email]
    );

    let isNewSubscriber = false;
    if (!existingSubscriber) {
      await execute(
        `INSERT INTO newsletter_subscribers (email, name, source) VALUES (?, ?, 'contact')`,
        [sanitizedData.email, sanitizedData.name]
      );
      isNewSubscriber = true;
    }

    // Get language from request body
    const language = body.language === 'en' ? 'en' : 'ar';

    // Send emails (non-blocking)
    try {
      // Send confirmation to customer
      await sendContactConfirmation({
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        type: sanitizedData.type || 'general',
        language,
      });

      // Send notification to admin
      await sendContactAdminNotification({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone || undefined,
        company: sanitizedData.company || undefined,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        type: sanitizedData.type || 'general',
      });

      // Send newsletter welcome if new subscriber
      if (isNewSubscriber) {
        await sendNewsletterWelcome({
          email: sanitizedData.email,
          name: sanitizedData.name,
        });
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { success: true, message: 'تم إرسال رسالتك بنجاح' },
      { status: 200, headers: securityHeaders }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' },
      { status: 500, headers: securityHeaders }
    );
  }
}
