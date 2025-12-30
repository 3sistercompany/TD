/**
 * Edge-compatible email module
 * On Cloudflare Edge, we can't use nodemailer (requires Node.js crypto/fs)
 * Instead, we'll use fetch to call an external email API or skip emails
 * 
 * For production, consider using:
 * - Resend (https://resend.com) - has edge-compatible SDK
 * - SendGrid API
 * - Mailgun API
 * - Cloudflare Email Workers
 */

// For now, these are no-op functions that log the email data
// The data is already saved to the database, so emails can be sent later

export const sendContactConfirmation = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
  language?: 'ar' | 'en';
}) => {
  console.log('[Edge Email] Contact confirmation would be sent to:', data.email);
  // In production, use fetch to call Resend/SendGrid API
  return Promise.resolve();
};

export const sendContactAdminNotification = async (data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  type: string;
}) => {
  console.log('[Edge Email] Admin notification for contact from:', data.name);
  return Promise.resolve();
};

export const sendQuoteConfirmation = async (data: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  serviceType: string;
  originCity?: string;
  destinationCity?: string;
  estimatedVolume?: string;
  language?: 'ar' | 'en';
}) => {
  console.log('[Edge Email] Quote confirmation would be sent to:', data.email);
  return Promise.resolve();
};

export const sendQuoteAdminNotification = async (data: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  serviceType: string;
  originCity?: string;
  destinationCity?: string;
  estimatedVolume?: string;
  additionalDetails?: string;
}) => {
  console.log('[Edge Email] Admin notification for quote from:', data.name);
  return Promise.resolve();
};

export const sendNewBlogPostNotification = async (
  subscribers: { email: string; name?: string }[],
  post: { title: string; excerpt: string; slug: string }
) => {
  console.log('[Edge Email] Blog notification would be sent to', subscribers.length, 'subscribers for:', post.title);
  return Promise.resolve();
};

export const sendNewsletterWelcome = async (data: {
  email: string;
  name?: string;
  language?: 'ar' | 'en';
}) => {
  console.log('[Edge Email] Newsletter welcome would be sent to:', data.email);
  return Promise.resolve();
};
