import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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
    default: 'تي دي للخدمات اللوجستية | شريكك الموثوق في الخدمات اللوجستية',
    template: '%s | تي دي للخدمات اللوجستية',
  },
  description: 'شريكك الموثوق في الخدمات اللوجستية. نقدم خدمات لوجستية متكاملة بأعلى معايير الجودة والأمان في المملكة العربية السعودية. توصيل سريع، تتبع مباشر، دفع عند الاستلام.',
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
  icons: {
    icon: [
      { url: '/tabicon.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/tabicon.png',
    apple: '/tabicon.png',
  },
  alternates: {
    canonical: '/',
    languages: {
      'ar-SA': '/',
    },
  },
  openGraph: {
    title: 'تي دي للخدمات اللوجستية | شريكك الموثوق في الخدمات اللوجستية',
    description: 'خدمات لوجستية متكاملة في السعودية. توصيل سريع، تتبع مباشر، دفع عند الاستلام. معدل توصيل 93%+ في الوقت المحدد.',
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
    description: 'شريكك الموثوق في الخدمات اللوجستية في السعودية',
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
        {/* Icons */}
        <link rel="icon" href="/tabicon.png" type="image/png" />
        <link rel="shortcut icon" href="/tabicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/tabicon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Performance */}
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.gstatic.com" />
        <link rel="dns-prefetch" href="https://apisv2.logestechs.com" />
        <link rel="preload" href="/logo.png" as="image" type="image/png" />

        <meta name="theme-color" content="#1a365d" />

        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-M6D4D0936Z"
          strategy="afterInteractive"
        />
        <Script id="google-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M6D4D0936Z');
          `}
        </Script>

        {/* Global styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *{margin:0;padding:0;box-sizing:border-box}
              html{scroll-behavior:smooth;overflow-x:hidden;width:100%;max-width:100vw}
              body{overflow-x:hidden;width:100%;max-width:100vw;font-family:'Cairo',sans-serif;background-color:#fff;color:#111827;direction:rtl;text-align:right;line-height:1.7;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
              #__next,main{overflow-x:hidden;width:100%;max-width:100vw}
            `,
          }}
        />
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
