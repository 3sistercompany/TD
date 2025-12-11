'use client';

import { FiCheck } from 'react-icons/fi';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from './QaseemSection.module.css';

export default function QaseemSection() {
  const { t } = useLanguage();

  const features = [
    t('qaseem.feature1'),
    t('qaseem.feature2'),
    t('qaseem.feature3'),
  ];

  return (
    <section className={styles.qaseemSection}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.imageContent}>
            <div className={styles.imageWrapper}>
              <Image
                src="/qaseem.jpg"
                alt="Qaseem Region"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>

          <div className={styles.textContent}>
            <h2>{t('qaseem.title')}</h2>
            <p className={styles.subtitle}>{t('qaseem.subtitle')}</p>
            <p className={styles.description}>{t('qaseem.description')}</p>
            
            <div className={styles.cities}>
              <span className={styles.cityTag}>{t('qaseem.cities.buraidah')}</span>
              <span className={styles.cityTag}>{t('qaseem.cities.unaizah')}</span>
              <span className={styles.cityTag}>{t('qaseem.cities.alRass')}</span>
              <span className={styles.cityTag}>{t('qaseem.cities.alBukayriyah')}</span>
              <span className={styles.cityTag}>{t('qaseem.cities.alBadaya')}</span>
              <span className={styles.cityTag}>{t('qaseem.cities.riyadhAlKhabra')}</span>
            </div>
            
            <div className={styles.features}>
              {features.map((feature, index) => (
                <div key={index} className={styles.feature}>
                  <FiCheck className={styles.checkIcon} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className={styles.amazonBadge}>
              <div className={styles.amazonLogo}>
                <span className={styles.amazonText}>amazon</span>
              </div>
              <div className={styles.partnerText}>
                <span className={styles.weAre}>{t('qaseem.weAre')}</span>
                <span className={styles.inclusive}>{t('qaseem.inclusivePartner')}</span>
                <span className={styles.region}>{t('qaseem.inQaseemRegion')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
