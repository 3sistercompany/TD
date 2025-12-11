'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from './ClientsSection.module.css';

interface Client {
  id: number;
  name: string;
  logo_url: string | null;
}

export default function ClientsSection() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [isWrapped, setIsWrapped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients', { cache: 'no-store' });
        const data = await res.json();
        if (data.clients) setClients(data.clients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
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
  }, [clients]);

  useEffect(() => {
    if (!isWrapped || clients.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % clients.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isWrapped, clients.length]);

  useEffect(() => {
    if (!isWrapped || !sliderRef.current) return;
    const item = sliderRef.current.children[currentIndex] as HTMLElement;
    if (item) {
      sliderRef.current.scrollTo({ left: item.offsetLeft - 20, behavior: 'smooth' });
    }
  }, [currentIndex, isWrapped]);

  if (clients.length === 0) return null;

  const renderClient = (client: Client) => (
    client.logo_url ? (
      <img src={client.logo_url} alt={client.name} className={styles.logo} />
    ) : (
      <div className={styles.placeholder}>
        <span>{client.name.charAt(0)}</span>
      </div>
    )
  );

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2>{t('clients.title')}</h2>
          <p>{t('clients.subtitle')}</p>
        </div>

        
        {!isWrapped ? (
          <div ref={gridRef} className={styles.grid}>
            {clients.map((client) => (
              <div key={client.id} className={styles.item}>
                {renderClient(client)}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div ref={gridRef} className={styles.gridHidden}>
              {clients.map((client) => (
                <div key={client.id} className={styles.item}>
                  {renderClient(client)}
                </div>
              ))}
            </div>
            <div ref={sliderRef} className={styles.slider}>
              {clients.map((client) => (
                <div key={client.id} className={styles.item}>
                  {renderClient(client)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
