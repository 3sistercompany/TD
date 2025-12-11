'use client';

import { useState, useEffect, useRef } from 'react';
import { FiStar } from 'react-icons/fi';
import { useLanguage } from '@/lib/i18n';
import styles from './Testimonials.module.css';

interface Review {
  id: number;
  customer_name: string;
  company_name: string | null;
  position: string | null;
  review_text: string;
  rating: number;
  avatar_url: string | null;
}

export default function Testimonials() {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWrapped, setIsWrapped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews?limit=12', { cache: 'no-store' });
        const data = await res.json();
        if (data.reviews) setReviews(data.reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
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
  }, [reviews]);

  useEffect(() => {
    if (!isWrapped || reviews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isWrapped, reviews.length]);

  useEffect(() => {
    if (!isWrapped || !sliderRef.current) return;
    const item = sliderRef.current.children[currentIndex] as HTMLElement;
    if (item) {
      sliderRef.current.scrollTo({ left: item.offsetLeft - 20, behavior: 'smooth' });
    }
  }, [currentIndex, isWrapped]);

  if (reviews.length === 0) return null;

  const renderCard = (review: Review) => (
    <div className={styles.card}>
      <div className={styles.rating}>
        {[...Array(review.rating)].map((_, i) => (
          <FiStar key={i} className={styles.star} />
        ))}
      </div>
      <p className={styles.text}>{review.review_text}</p>
      <div className={styles.author}>
        <div className={styles.avatar}>
          {review.avatar_url ? (
            <img src={review.avatar_url} alt={review.customer_name} />
          ) : (
            <span>{review.customer_name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h4>{review.customer_name}</h4>
          <p>
            {review.position && `${review.position}${language === 'ar' ? '، ' : ', '}`}
            {review.company_name}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2>{t('home.testimonials.title')}</h2>
          <p>{t('home.testimonials.subtitle')}</p>
        </div>

        
        {!isWrapped ? (
          <div ref={gridRef} className={styles.grid}>
            {reviews.map((review) => (
              <div key={review.id}>{renderCard(review)}</div>
            ))}
          </div>
        ) : (
          <>
            <div ref={gridRef} className={styles.gridHidden}>
              {reviews.map((review) => (
                <div key={review.id}>{renderCard(review)}</div>
              ))}
            </div>
            <div ref={sliderRef} className={styles.slider}>
              {reviews.map((review) => (
                <div key={review.id}>{renderCard(review)}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
