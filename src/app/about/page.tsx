'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FiTruck, FiTarget, FiAward, FiUsers, FiCheckCircle } from 'react-icons/fi';
import Testimonials from '@/components/home/Testimonials';
import CTA from '@/components/home/CTA';
import styles from './page.module.css';

export default function AboutPage() {
  const { t } = useLanguage();

  const values = [
    {
      icon: <FiCheckCircle />,
      title: t('about.values.reliability.title'),
      description: t('about.values.reliability.description'),
    },
    {
      icon: <FiAward />,
      title: t('about.values.quality.title'),
      description: t('about.values.quality.description'),
    },
    {
      icon: <FiUsers />,
      title: t('about.values.customer.title'),
      description: t('about.values.customer.description'),
    },
    {
      icon: <FiTruck />,
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.description'),
    },
  ];

  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1>{t('about.hero.title')}</h1>
          <p>{t('about.hero.subtitle')}</p>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.content}>
            <div className={styles.textContent}>
              <h2>{t('about.story.title')}</h2>
              <p>{t('about.story.paragraph1')}</p>
              <p>{t('about.story.paragraph2')}</p>
              <p>{t('about.story.paragraph3')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className={styles.missionVision}>
        <div className="container">
          <div className={styles.mvGrid}>
            <div className={styles.mvCard}>
              <div className={styles.mvIcon}>
                <FiTarget />
              </div>
              <h3>{t('about.mission.title')}</h3>
              <p>{t('about.mission.description')}</p>
            </div>
            <div className={styles.mvCard}>
              <div className={styles.mvIcon}>
                <FiTruck />
              </div>
              <h3>{t('about.vision.title')}</h3>
              <p>{t('about.vision.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Divider - 3 images in a row */}
      <section className={styles.imageDivider}>
        <div className={styles.imageGrid}>
          <div className={styles.imageItem}>
            <img src="/aboutus_1.webp" alt="Operations" className={styles.aboutImg} />
          </div>
          <div className={styles.imageItem}>
            <img src="/aboutus_2.jpg" alt="Our Team" className={styles.aboutImg} />
          </div>
          <div className={styles.imageItem}>
            <img src="/aboutus_3.jpg" alt="Delivery Excellence" className={styles.aboutImg} />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>{t('about.values.title')}</h2>
            <p>{t('about.values.subtitle')}</p>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <div key={index} className={styles.valueCard}>
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Stats */}
      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>+500K</span>
              <span className={styles.statLabel}>{t('home.stats.deliveries')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>+1000</span>
              <span className={styles.statLabel}>{t('home.stats.clients')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>+50</span>
              <span className={styles.statLabel}>{t('home.stats.cities')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>99%</span>
              <span className={styles.statLabel}>{t('home.stats.onTime')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTA />
    </div>
  );
}
