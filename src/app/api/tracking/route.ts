import { NextRequest, NextResponse } from 'next/server';
import { sanitizeTrackingNumber } from '@/lib/security/sanitize';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';

export const runtime = 'edge';

// Security headers for API responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, max-age=0',
};

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting
    const rateLimitKey = getRateLimitKey(ip, 'tracking');
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.tracking);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.' },
        { 
          status: 429,
          headers: {
            ...securityHeaders,
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
          }
        }
      );
    }

    // Get and validate barcode
    const { searchParams } = new URL(request.url);
    const rawBarcode = searchParams.get('barcode');
    
    if (!rawBarcode) {
      return NextResponse.json(
        { error: 'رقم التتبع مطلوب' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Sanitize input
    const barcode = sanitizeTrackingNumber(rawBarcode);
    
    if (!barcode) {
      return NextResponse.json(
        { error: 'رقم التتبع غير صالح' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Call external API
    const apiUrl = `https://apisv2.logestechs.com/api/guests/398/packages/tracking?barcode=${encodeURIComponent(barcode)}&isShowFullHistory=1`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'لم يتم العثور على الشحنة. يرجى التأكد من رقم التتبع.' },
          { status: 404, headers: securityHeaders }
        );
      }
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response');
    }

    // Filter sensitive data before sending to client
    const safeData = {
      barcode: data.barcode,
      status: data.status,
      arStatus: data.arStatus,
      enStatus: data.enStatus,
      fullReceiverName: data.fullReceiverName ? maskName(data.fullReceiverName) : null,
      destinationAddress: data.destinationAddress ? {
        city: data.destinationAddress.city,
        arabicCityName: data.destinationAddress.arabicCityName,
        region: data.destinationAddress.region,
        arabicRegionName: data.destinationAddress.arabicRegionName,
      } : null,
      deliveryRoute: Array.isArray(data.deliveryRoute) 
        ? data.deliveryRoute.map((event: Record<string, unknown>) => ({
            name: event.name,
            arabicName: event.arabicName,
            deliveryDate: event.deliveryDate,
            type: event.type,
            status: event.status,
            userName: event.userName,
            arrived: event.arrived,
          }))
        : [],
      createdDate: data.createdDate,
      deliveryDate: data.deliveryDate,
      expectedDeliveryDate: data.expectedDeliveryDate,
    };

    return NextResponse.json(safeData, {
      status: 200,
      headers: {
        ...securityHeaders,
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      }
    });

  } catch (error) {
    console.error('Tracking API error:', error);
    
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// Mask name for privacy (show first and last character only)
function maskName(name: string): string {
  if (!name || name.length < 3) return '***';
  const parts = name.split(' ');
  return parts.map(part => {
    if (part.length < 2) return '*';
    return part[0] + '*'.repeat(Math.min(part.length - 2, 3)) + part[part.length - 1];
  }).join(' ');
}
