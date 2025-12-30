'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowRight, FiArrowLeft, FiSave, FiEye, FiTrash2, FiStar } from 'react-icons/fi';
import ImageUploader from '@/components/admin/ImageUploader';
import { useLanguage } from '@/lib/i18n';
import styles from '../../page.module.css';

interface Review {
  id: number;
  customer_name: string;
  company_name: string | null;
  position: string | null;
  review_text: string;
  rating: number;
  avatar_url: string | null;
  status: string;
}

export default function EditReviewPage() {
  const { t, isRTL } = useLanguage();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [avatarImages, setAvatarImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    position: '',
    review_text: '',
    rating: 5,
    status: 'pending',
  });

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`/api/admin/reviews/${id}`);
        if (!res.ok) throw new Error(t('dashboard.reviewNotFound'));
        
        const review: Review = await res.json();
        setFormData({
          customer_name: review.customer_name,
          company_name: review.company_name || '',
          position: review.position || '',
          review_text: review.review_text,
          rating: review.rating,
          status: review.status,
        });
        if (review.avatar_url) {
          setAvatarImages([review.avatar_url]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('dashboard.errorOccurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();
    
    if (!formData.customer_name.trim() || !formData.review_text.trim()) {
      setError(t('dashboard.reviewRequired'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          avatar_url: avatarImages[0] || null,
          status: publishNow ? 'published' : formData.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('dashboard.errorOccurred'));
      }

      router.push('/dashboard/reviews');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dashboard.errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('dashboard.confirmDeleteReview'))) return;

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/reviews');
      }
    } catch {
      setError(t('dashboard.errorDeleting'));
    }
  };

  const ArrowIcon = isRTL ? FiArrowRight : FiArrowLeft;

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className="container">
          <div className={styles.loading}>{t('dashboard.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <Link href="/dashboard/reviews" className={styles.backLink}>
              <ArrowIcon />
              {t('dashboard.backToReviews')}
            </Link>
            <h1>{t('dashboard.editReview')}</h1>
          </div>
          <button onClick={handleDelete} className="btn btn-danger">
            <FiTrash2 />
            {t('dashboard.delete')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formCard}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('dashboard.reviews.customerName')} *</label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className={styles.input}
                placeholder={t('dashboard.reviews.customerNamePlaceholder')}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('dashboard.reviews.companyName')}</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className={styles.input}
                placeholder={t('dashboard.reviews.companyNamePlaceholderEdit')}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('dashboard.reviews.position')}</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={styles.input}
                placeholder={t('dashboard.reviews.positionPlaceholderEdit')}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('dashboard.reviews.rating')}</label>
              <div className={styles.ratingInput}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.starBtn} ${formData.rating >= star ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  >
                    <FiStar />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Avatar Uploader */}
          <ImageUploader
            images={avatarImages}
            onChange={setAvatarImages}
            folder="avatars"
            single={true}
            label={t('dashboard.reviews.customerImage')}
          />

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.reviews.reviewText')} *</label>
            <textarea
              name="review_text"
              value={formData.review_text}
              onChange={handleChange}
              className={styles.textarea}
              placeholder={t('dashboard.reviews.reviewTextPlaceholder')}
              rows={5}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.reviews.status')}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="pending">{t('dashboard.reviews.statusPending')}</option>
              <option value="published">{t('dashboard.reviews.statusPublished')}</option>
              <option value="rejected">{t('dashboard.reviews.statusRejected')}</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className="btn btn-secondary" disabled={saving}>
              <FiSave />
              {t('dashboard.saveChanges')}
            </button>
            {formData.status !== 'published' && (
              <button 
                type="button" 
                className="btn btn-primary" 
                disabled={saving}
                onClick={(e) => handleSubmit(e, true)}
              >
                <FiEye />
                {t('dashboard.publishNow')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
