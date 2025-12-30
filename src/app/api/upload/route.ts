import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'logos';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }

    // Edge runtime limitation: Cannot write to filesystem
    // In production, use Cloudflare R2, AWS S3, or similar cloud storage
    // For now, return a placeholder response
    console.log('[Edge Upload] File upload received:', file.name, 'to folder:', folder);
    
    // Generate a placeholder URL (in production, upload to R2/S3 and return real URL)
    const ext = file.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomStr}.${ext}`;
    
    // TODO: Implement Cloudflare R2 upload
    // For now, return error explaining the limitation
    return NextResponse.json(
      { 
        error: 'File upload is not available in edge runtime. Please upload images directly to your hosting or use a cloud storage service.',
        suggestion: 'Consider using Cloudflare R2 or uploading images manually to the public folder.'
      }, 
      { status: 501 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
