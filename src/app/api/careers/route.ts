import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { execute } from '@/lib/db';
import nodemailer from 'nodemailer';

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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

    // Send confirmation email to applicant
    try {
      await transporter.sendMail({
        from: `"TD Logistics" <${process.env.SMTP_USER}>`,
        to: sanitizedData.email,
        subject: isArabic ? 'تم استلام طلب التوظيف - تي دي للخدمات اللوجستية' : 'Application Received - TD Logistics',
        html: `
          <div dir="${isArabic ? 'rtl' : 'ltr'}" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #b23028; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">TD Logistics</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">${isArabic ? 'شكراً لتقديمك!' : 'Thank you for applying!'}</h2>
              <p style="color: #666; line-height: 1.6;">
                ${isArabic 
                  ? `مرحباً ${sanitizedData.name}، تم استلام طلب التوظيف الخاص بك بنجاح. سيقوم فريق الموارد البشرية بمراجعة طلبك والتواصل معك في أقرب وقت.`
                  : `Hello ${sanitizedData.name}, your job application has been received successfully. Our HR team will review your application and contact you soon.`
                }
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #b23028; margin-top: 0;">${isArabic ? 'تفاصيل الطلب' : 'Application Details'}</h3>
                <p><strong>${isArabic ? 'الوظيفة:' : 'Position:'}</strong> ${sanitizedData.position}</p>
                <p><strong>${isArabic ? 'الهاتف:' : 'Phone:'}</strong> ${sanitizedData.phone}</p>
              </div>
            </div>
            <div style="background: #333; padding: 20px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">© 2024 TD Logistics. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      // Send notification to admin
      await transporter.sendMail({
        from: `"TD Logistics Careers" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: `طلب توظيف جديد - ${sanitizedData.position}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #b23028; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">طلب توظيف جديد</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <p><strong>الاسم:</strong> ${sanitizedData.name}</p>
                <p><strong>البريد الإلكتروني:</strong> ${sanitizedData.email}</p>
                <p><strong>الهاتف:</strong> ${sanitizedData.phone}</p>
                <p><strong>الوظيفة:</strong> ${sanitizedData.position}</p>
                ${sanitizedData.message ? `<p><strong>رسالة:</strong> ${sanitizedData.message}</p>` : ''}
              </div>
            </div>
          </div>
        `,
      });
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
