import { NextRequest, NextResponse } from 'next/server';
import { quoteSchema } from '@/lib/validation/schemas';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { execute, queryOne } from '@/lib/db';
import { sendQuoteConfirmation, sendQuoteAdminNotification, sendNewsletterWelcome } from '@/lib/email';

export const runtime = 'edge';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, max-age=0',
};

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting
    const rateLimitKey = getRateLimitKey(ip, 'quote');
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

    // Validate with Zod
    const validation = quoteSchema.safeParse(body);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400, headers: securityHeaders }
      );
    }

    const data = validation.data;

    // Sanitize
    const sanitizedData = {
      name: sanitizeInput(data.name),
      email: sanitizeEmail(data.email),
      phone: sanitizePhone(data.phone),
      company: data.company ? sanitizeInput(data.company) : null,
      serviceType: sanitizeInput(data.serviceType),
      originCity: data.originCity ? sanitizeInput(data.originCity) : null,
      destinationCity: data.destinationCity ? sanitizeInput(data.destinationCity) : null,
      estimatedVolume: data.estimatedVolume ? sanitizeInput(data.estimatedVolume) : null,
      additionalDetails: data.additionalDetails ? sanitizeInput(data.additionalDetails) : null,
    };

    if (!sanitizedData.email || !sanitizedData.phone) {
      return NextResponse.json(
        { error: 'بيانات التواصل غير صالحة' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Insert into database
    await execute(
      `INSERT INTO quote_requests 
       (name, email, phone, company, service_type, origin_city, destination_city, estimated_volume, additional_details) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizedData.name,
        sanitizedData.email,
        sanitizedData.phone,
        sanitizedData.company,
        sanitizedData.serviceType,
        sanitizedData.originCity,
        sanitizedData.destinationCity,
        sanitizedData.estimatedVolume,
        sanitizedData.additionalDetails,
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
        `INSERT INTO newsletter_subscribers (email, name, source) VALUES (?, ?, 'quote')`,
        [sanitizedData.email, sanitizedData.name]
      );
      isNewSubscriber = true;
    }

    // Get language from request body
    const language = body.language === 'en' ? 'en' : 'ar';

    // Send emails (non-blocking)
    try {
      // Send confirmation to customer
      await sendQuoteConfirmation({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone!,
        company: sanitizedData.company || undefined,
        serviceType: sanitizedData.serviceType,
        originCity: sanitizedData.originCity || undefined,
        destinationCity: sanitizedData.destinationCity || undefined,
        estimatedVolume: sanitizedData.estimatedVolume || undefined,
        language,
      });

      // Send notification to admin
      await sendQuoteAdminNotification({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone!,
        company: sanitizedData.company || undefined,
        serviceType: sanitizedData.serviceType,
        originCity: sanitizedData.originCity || undefined,
        destinationCity: sanitizedData.destinationCity || undefined,
        estimatedVolume: sanitizedData.estimatedVolume || undefined,
        additionalDetails: sanitizedData.additionalDetails || undefined,
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
      { success: true, message: 'تم إرسال طلبك بنجاح' },
      { status: 200, headers: securityHeaders }
    );

  } catch (error) {
    console.error('Quote request error:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.' },
      { status: 500, headers: securityHeaders }
    );
  }
}
