'use client';

import Link from 'next/link';
import { FiTruck, FiPackage, FiRefreshCw, FiDollarSign, FiBox, FiShield, FiCheck, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useLanguage } from '@/lib/i18n';
import CTA from '@/components/home/CTA';
import styles from './page.module.css';

const serviceIcons = {
  delivery: FiTruck,
  storage: FiBox,
  fulfillment: FiPackage,
  cod: FiDollarSign,
  returns: FiRefreshCw,
  insurance: FiShield,
};

const serviceIds = ['delivery', 'storage', 'fulfillment', 'cod', 'returns', 'insurance'] as const;

export default function ServicesContent() {
  const { t, tArray, isRTL } = useLanguage();

  return (
    <div className={styles.servicesPage}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <h1>{t('services.pageTitle')}</h1>
          <p>{t('services.pageSubtitle')}</p>
        </div>
      </section>

      {/* Services List */}
      <section className={styles.servicesList}>
        <div className="container">
          {serviceIds.map((serviceId, index) => {
            const Icon = serviceIcons[serviceId];
            const features = tArray(`services.list.${serviceId}.features`);
            
            return (
              <div 
                key={serviceId} 
                id={serviceId}
                className={`${styles.serviceItem} ${index % 2 === 1 ? styles.reversed : ''}`}
              >
                <div className={styles.serviceContent}>
                  <div className={styles.serviceIcon}>
                    <Icon />
                  </div>
                  <h2>{t(`services.list.${serviceId}.title`)}</h2>
                  <p className={styles.serviceDesc}>{t(`services.list.${serviceId}.description`)}</p>
                  <ul className={styles.featuresList}>
                    {Array.isArray(features) && features.map((feature, i) => (
                      <li key={i}>
                        <FiCheck className={styles.checkIcon} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/quote" className={styles.serviceLink}>
                    {t('services.requestService')}
                    {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
                  </Link>
                </div>
                <div className={styles.serviceImage}>
                  <img 
                    src={`/${serviceId === 'delivery' ? 'express_delivery.jpg' : 
                          serviceId === 'storage' ? 'Storage & Warehousing.jpg' :
                          serviceId === 'fulfillment' ? 'Fulfillment Services.jpg' :
                          serviceId === 'cod' ? 'Cash on Delivery.jpg' :
                          serviceId === 'returns' ? 'Returns Management.jpg' :
                          'Shipment Insurance.jpg'}`}
                    alt={t(`services.list.${serviceId}.title`)}
                    className={styles.serviceImg}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <CTA />
    </div>
  );
}
