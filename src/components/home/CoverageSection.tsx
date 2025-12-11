'use client';

import { FiUsers, FiCheckCircle, FiMapPin } from 'react-icons/fi';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from './CoverageSection.module.css';

export default function CoverageSection() {
  const { t } = useLanguage();

  const stats = [
    {
      icon: FiUsers,
      value: '+150,000',
      label: t('coverage.clients'),
    },
    {
      icon: FiCheckCircle,
      value: '99%',
      label: t('coverage.successDelivery'),
    },
    {
      icon: FiMapPin,
      value: '+150',
      label: t('coverage.cities'),
    },
  ];

  return (
    <section className={styles.coverageSection}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.textContent}>
            <h2>{t('coverage.title')}</h2>
            <p className={styles.subtitle}>{t('coverage.subtitle')}</p>

            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} className={styles.statCard}>
                  <stat.icon className={styles.statIcon} />
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.mapContent}>
            <div className={styles.mapWrapper}>
              <Image
                src="/saudi arabia.jpg"
                alt="Saudi Arabia Coverage Map"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
