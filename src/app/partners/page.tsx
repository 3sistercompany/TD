'use client';

import Link from 'next/link';
import { FiCheckCircle, FiTrendingUp, FiCreditCard, FiSettings, FiRotateCcw, FiHeadphones, FiShield } from 'react-icons/fi';
import FAQ from '@/components/ui/FAQ';
import Testimonials from '@/components/home/Testimonials';
import ClientLogos from '@/components/home/ClientLogos';
import { useLanguage } from '@/lib/i18n';
import styles from './page.module.css';

export default function PartnersPage() {
  const { t, language } = useLanguage();

  const benefits = [
    {
      icon: FiTrendingUp,
      title: t('partners.benefits.items.growth.title'),
      description: t('partners.benefits.items.growth.description'),
    },
    {
      icon: FiCreditCard,
      title: t('partners.benefits.items.cod.title'),
      description: t('partners.benefits.items.cod.description'),
    },
    {
      icon: FiSettings,
      title: t('partners.benefits.items.api.title'),
      description: t('partners.benefits.items.api.description'),
    },
    {
      icon: FiRotateCcw,
      title: t('partners.benefits.items.returns.title'),
      description: t('partners.benefits.items.returns.description'),
    },
    {
      icon: FiHeadphones,
      title: t('partners.benefits.items.account.title'),
      description: t('partners.benefits.items.account.description'),
    },
    {
      icon: FiShield,
      title: t('partners.benefits.items.insurance.title'),
      description: t('partners.benefits.items.insurance.description'),
    },
  ];

  const stats = [
    { value: '99.2%', label: t('partners.stats.onTime') },
    { value: '24/7', label: t('partners.stats.support') },
    { value: '+1000', label: t('partners.stats.partners') },
    { value: '+50', label: t('partners.stats.cities') },
  ];

  const faqItems = [
    {
      question: language === 'ar' ? 'ما هي متطلبات الانضمام لبرنامج الشراكة؟' : 'What are the requirements to join the partnership program?',
      answer: language === 'ar' 
        ? 'نرحب بجميع الشركات من الشركات الناشئة إلى المؤسسات الكبيرة. المتطلبات الأساسية هي وجود نشاط تجاري مسجل في السعودية والحاجة إلى خدمات لوجستية منتظمة.'
        : 'We welcome all businesses from startups to large enterprises. The basic requirements are having a registered business in Saudi Arabia and the need for regular logistics services.',
    },
    {
      question: language === 'ar' ? 'كم يستغرق الحصول على عرض سعر؟' : 'How long does it take to get a quote?',
      answer: language === 'ar'
        ? 'نرد على جميع طلبات عروض الأسعار خلال 24 ساعة عمل. سيتواصل معك فريق المبيعات لفهم احتياجاتك وتقديم عرض مخصص.'
        : 'We respond to all quote requests within 24 business hours. Our sales team will contact you to understand your needs and provide a customized quote.',
    },
    {
      question: language === 'ar' ? 'هل يمكنني تتبع جميع شحناتي في مكان واحد؟' : 'Can I track all my shipments in one place?',
      answer: language === 'ar'
        ? 'نعم، نوفر لوحة تحكم شاملة مع تتبع في الوقت الفعلي لجميع شحناتك، تقارير مفصلة، وتكامل API مع أنظمتك الحالية.'
        : 'Yes, we provide a comprehensive dashboard with real-time tracking for all your shipments, detailed reports, and API integration with your existing systems.',
    },
    {
      question: language === 'ar' ? 'ما هي المناطق التي تغطيها خدماتكم؟' : 'What areas do your services cover?',
      answer: language === 'ar'
        ? 'نغطي أكثر من 50 مدينة في جميع أنحاء المملكة العربية السعودية، بما في ذلك الرياض، جدة، الدمام، مكة، المدينة، وجميع المدن الرئيسية.'
        : 'We cover more than 50 cities across Saudi Arabia, including Riyadh, Jeddah, Dammam, Mecca, Medina, and all major cities.',
    },
    {
      question: language === 'ar' ? 'هل توفرون خدمة الدفع عند الاستلام (COD)؟' : 'Do you offer Cash on Delivery (COD) service?',
      answer: language === 'ar'
        ? 'نعم، نوفر خدمة تحصيل الدفع عند الاستلام الكاملة مع تحويل آمن للأموال وتقارير مالية شاملة. نتعامل مع جميع جوانب إدارة النقد لعملك.'
        : 'Yes, we offer full COD collection service with secure fund transfer and comprehensive financial reports. We handle all aspects of cash management for your business.',
    },
    {
      question: language === 'ar' ? 'كيف يتم التعامل مع المرتجعات؟' : 'How are returns handled?',
      answer: language === 'ar'
        ? 'لدينا نظام لوجستيات عكسية متكامل يشمل استلام المرتجعات، فحص الجودة، تنسيق التجديد، وإدارة المخزون. نجعل عملية المرتجعات سلسة لك ولعملائك.'
        : 'We have a comprehensive reverse logistics system that includes returns pickup, quality inspection, refurbishment coordination, and inventory management. We make the returns process smooth for you and your customers.',
    },
  ];

  // Structured Data for Partnership Program
  const partnershipSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: language === 'ar' ? 'برنامج الشراكة اللوجستية' : 'Logistics Partnership Program',
    provider: {
      '@type': 'Organization',
      name: language === 'ar' ? 'تي دي للخدمات اللوجستية' : 'TD Logistics',
      url: 'https://tdlogistics.sa',
    },
    areaServed: {
      '@type': 'Country',
      name: language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia',
    },
    description: t('partners.hero.subtitle'),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'SAR',
      },
    },
  };

  return (
    <div className={styles.partnersPage}>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(partnershipSchema) }}
      />
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1>
                {t('partners.hero.title1')}
                <span className={styles.highlight}> {t('partners.hero.highlight')}</span>
                <br />{t('partners.hero.title2')}
              </h1>
              <p>{t('partners.hero.subtitle')}</p>

              <div className={styles.heroFeatures}>
                <div className={styles.featureItem}>
                  <FiCheckCircle />
                  <span>{t('partners.hero.features.onTime')}</span>
                </div>
                <div className={styles.featureItem}>
                  <FiCheckCircle />
                  <span>{t('partners.hero.features.support')}</span>
                </div>
                <div className={styles.featureItem}>
                  <FiCheckCircle />
                  <span>{t('partners.hero.features.cod')}</span>
                </div>
              </div>

              <div className={styles.heroActions}>
                <Link href="/quote" className="btn btn-primary btn-lg">
                  {t('partners.hero.cta')}
                </Link>
                <Link href="/services" className={styles.secondaryLink}>
                  {t('partners.hero.viewServices')}
                </Link>
              </div>
            </div>

            <div className={styles.heroImage}>
              <div className={styles.imageWrapper}>
                <img 
                  src="/why_choose_td.webp" 
                  alt={language === 'ar' ? 'شراكة تي دي للخدمات اللوجستية' : 'TD Logistics Partnership'} 
                  className={styles.heroImg}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>{t('partners.benefits.title')}</h2>
            <p>{t('partners.benefits.subtitle')}</p>
          </div>

          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <div key={index} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <benefit.icon />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section className={styles.quoteSection}>
        <div className="container">
          <div className={styles.quoteContent}>
            <div className={styles.quoteInfo}>
              <h2>{t('partners.quote.title')}</h2>
              <p>{t('partners.quote.subtitle')}</p>

              <div className={styles.quoteFeatures}>
                <div className={styles.quoteFeature}>
                  <FiCheckCircle />
                  <div>
                    <strong>{t('partners.quote.features.fast.title')}</strong>
                    <p>{t('partners.quote.features.fast.description')}</p>
                  </div>
                </div>
                <div className={styles.quoteFeature}>
                  <FiCheckCircle />
                  <div>
                    <strong>{t('partners.quote.features.custom.title')}</strong>
                    <p>{t('partners.quote.features.custom.description')}</p>
                  </div>
                </div>
                <div className={styles.quoteFeature}>
                  <FiCheckCircle />
                  <div>
                    <strong>{t('partners.quote.features.noObligation.title')}</strong>
                    <p>{t('partners.quote.features.noObligation.description')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.quoteFormCard}>
              <h3>{t('partners.quote.formTitle')}</h3>
              <p>{t('partners.quote.formSubtitle')}</p>
              <Link href="/quote" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                {t('partners.quote.formButton')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* E-Commerce Platforms Section */}
      <ClientLogos />

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQ 
        items={faqItems}
        description={language === 'ar' 
          ? 'إجابات على الأسئلة الأكثر شيوعاً حول برنامج الشراكة مع تي دي للخدمات اللوجستية'
          : 'Answers to the most common questions about the partnership program with TD Logistics'
        }
      />

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>{t('partners.cta.title')}</h2>
            <p>{t('partners.cta.subtitle')}</p>
            <div className={styles.ctaActions}>
              <Link href="/quote" className="btn btn-primary btn-lg">
                {t('partners.cta.getQuote')}
              </Link>
              <Link href="/contact" className={styles.ctaSecondary}>
                {t('partners.cta.contactSales')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
