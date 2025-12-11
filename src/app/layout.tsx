import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingContact from '@/components/ui/FloatingContact';
import DynamicHead from '@/components/layout/DynamicHead';
import PageTransition from '@/components/ui/PageTransition';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'تي دي للخدمات اللوجستية | شريكك الموثوق في الشحن والتوصيل',
    template: '%s | تي دي للخدمات اللوجستية',
  },
  description: 'شريكك الموثوق في الشحن والتوصيل. نقدم خدمات لوجستية متكاملة بأعلى معايير الجودة والأمان في المملكة العربية السعودية. توصيل سريع، تتبع مباشر، دفع عند الاستلام.',
  keywords: [
    'شحن سريع السعودية',
    'توصيل الرياض',
    'خدمات لوجستية',
    'تي دي للخدمات اللوجستية',
    'TD Logistics',
    'شحن للميل الأخير',
    'دفع عند الاستلام',
    'تتبع الشحنات',
    'توصيل التجارة الإلكترونية',
    'شحن جدة',
    'توصيل الدمام',
    'خدمات الشحن السعودية',
  ],
  authors: [{ name: 'TD Logistics', url: 'https://tdlogistics.sa' }],
  creator: 'TD Logistics',
  publisher: 'TD Logistics',
  metadataBase: new URL('https://tdlogistics.sa'),
  alternates: {
    canonical: '/',
    languages: {
      'ar-SA': '/',
    },
  },
  openGraph: {
    title: 'تي دي للخدمات اللوجستية | شريكك الموثوق في الشحن والتوصيل',
    description: 'خدمات لوجستية متكاملة في السعودية. توصيل سريع، تتبع مباشر، دفع عند الاستلام. معدل توصيل 99.2% في الوقت المحدد.',
    type: 'website',
    locale: 'ar_SA',
    url: 'https://tdlogistics.sa',
    siteName: 'تي دي للخدمات اللوجستية',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'تي دي للخدمات اللوجستية',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تي دي للخدمات اللوجستية',
    description: 'شريكك الموثوق في الشحن والتوصيل في السعودية',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <DynamicHead />
          <Header />
          <PageTransition>
            <main>{children}</main>
          </PageTransition>
          <Footer />
          <FloatingContact />
        </LanguageProvider>
      </body>
    </html>
  );
}
