'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from './ClientLogos.module.css';

interface Brand {
  id: number;
  name: string;
  logo_url: string | null;
}

export default function ClientLogos() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isWrapped, setIsWrapped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/brands?type=platform', { cache: 'no-store' });
        const data = await res.json();
        if (data.brands) setBrands(data.brands);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const checkWrap = () => {
      const grid = gridRef.current;
      if (!grid || grid.children.length === 0) return;
      const firstItem = grid.children[0] as HTMLElement;
      const lastItem = grid.children[grid.children.length - 1] as HTMLElement;
      setIsWrapped(firstItem.offsetTop !== lastItem.offsetTop);
    };
    checkWrap();
    window.addEventListener('resize', checkWrap);
    return () => window.removeEventListener('resize', checkWrap);
  }, [brands]);

  useEffect(() => {
    if (!isWrapped || brands.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % brands.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isWrapped, brands.length]);

  useEffect(() => {
    if (!isWrapped || !sliderRef.current) return;
    const item = sliderRef.current.children[currentIndex] as HTMLElement;
    if (item) {
      sliderRef.current.scrollTo({ left: item.offsetLeft - 20, behavior: 'smooth' });
    }
  }, [currentIndex, isWrapped]);

  if (brands.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>{t('home.clientLogos.title')}</h2>

        
        {!isWrapped ? (
          <div ref={gridRef} className={styles.grid}>
            {brands.map((brand) => (
              <div key={brand.id} className={styles.item}>
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className={styles.logo} />
                ) : (
                  <span className={styles.name}>{brand.name}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div ref={gridRef} className={styles.gridHidden}>
              {brands.map((brand) => (
                <div key={brand.id} className={styles.item}>
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className={styles.logo} />
                  ) : (
                    <span className={styles.name}>{brand.name}</span>
                  )}
                </div>
              ))}
            </div>
            <div ref={sliderRef} className={styles.slider}>
              {brands.map((brand) => (
                <div key={brand.id} className={styles.item}>
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className={styles.logo} />
                  ) : (
                    <span className={styles.name}>{brand.name}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
