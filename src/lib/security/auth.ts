import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production-min-32-chars!'
);

const TOKEN_NAME = 'auth_token';
const TOKEN_EXPIRY = '24h';

export interface UserPayload {
  id: number;
  email: string;
  role: 'admin' | 'customer' | 'partner';
  name: string;
}

// Edge-compatible password hashing using Web Crypto API with PBKDF2
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const saltArray = Array.from(salt);
  // Format: salt$hash (both hex encoded)
  const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}$${hashHex}`;
}

// Edge-compatible password verification
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // Handle bcrypt hashes (legacy) - they start with $2
    if (storedHash.startsWith('$2')) {
      // For bcrypt hashes, we can't verify on edge - return false
      // User will need to reset password
      console.warn('Legacy bcrypt hash detected - cannot verify on edge runtime');
      return false;
    }
    
    // Handle PBKDF2 hashes (new format: salt$hash)
    const [saltHex, hashHex] = storedHash.split('$');
    if (!saltHex || !hashHex) return false;
    
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    const hashArray = Array.from(new Uint8Array(derivedBits));
    const computedHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return computedHashHex === hashHex;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Generate JWT token
export async function generateToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setJti(crypto.randomUUID())
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

// Get current user from cookie
export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

// Clear auth cookie
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

// Validate password strength
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  if (!/[A-Z]/.test(password)) errors.push('يجب أن تحتوي على حرف كبير');
  if (!/[a-z]/.test(password)) errors.push('يجب أن تحتوي على حرف صغير');
  if (!/[0-9]/.test(password)) errors.push('يجب أن تحتوي على رقم');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('يجب أن تحتوي على رمز خاص');
  
  return { valid: errors.length === 0, errors };
}
