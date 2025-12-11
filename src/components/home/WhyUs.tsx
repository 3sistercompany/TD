'use client';

import { FiCheck, FiHeadphones, FiShield } from 'react-icons/fi';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from './WhyUs.module.css';

const featureIcons = [FiCheck, FiShield, FiHeadphones];

export default function WhyUs() {
  const { t } = useLanguage();

  const features = [
    {
      icon: FiCheck,
      title: t('home.whyUs.features.onTime.title'),
      description: t('home.whyUs.features.onTime.description'),
    },
    {
      icon: FiShield,
      title: t('home.whyUs.features.secure.title'),
      description: t('home.whyUs.features.secure.description'),
    },
    {
      icon: FiHeadphones,
      title: t('home.whyUs.features.support.title'),
      description: t('home.whyUs.features.support.description'),
    },
  ];

  return (
    <section className={styles.whyUs}>
      <div className="container">
        <div className={styles.header}>
          <h2>{t('home.whyUs.title')}</h2>
          <p>{t('home.whyUs.subtitle')}</p>
        </div>

        <div className={styles.content}>
          <div className={styles.imageContent}>
            <div className={styles.imageWrapper}>
              <img src="/why_choose_td.webp" alt="Why Choose TD Logistics" className={styles.whyUsImg} />
            </div>
          </div>

          <div className={styles.featuresContent}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <feature.icon />
                </div>
                <div className={styles.featureText}>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
