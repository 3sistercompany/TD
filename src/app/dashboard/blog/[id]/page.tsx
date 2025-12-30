'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowRight, FiArrowLeft, FiSave, FiEye, FiTrash2 } from 'react-icons/fi';
import ImageUploader from '@/components/admin/ImageUploader';
import { useLanguage } from '@/lib/i18n';
import styles from '../../page.module.css';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  images: string | null;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
}

export default function EditBlogPostPage() {
  const { t, isRTL } = useLanguage();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/admin/blog/${id}`);
        if (!res.ok) throw new Error(t('dashboard.postNotFound'));
        
        const post: BlogPost = await res.json();
        setFormData({
          title: post.title,
          excerpt: post.excerpt || '',
          content: post.content,
          status: post.status,
          meta_title: post.meta_title || '',
          meta_description: post.meta_description || '',
        });
        
        // Parse images
        const postImages: string[] = [];
        if (post.featured_image) postImages.push(post.featured_image);
        if (post.images) {
          try {
            const additionalImages = JSON.parse(post.images);
            postImages.push(...additionalImages);
          } catch {}
        }
        setImages(postImages);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('dashboard.errorOccurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError(t('dashboard.titleRequired'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const featured_image = images[0] || null;
      const additionalImages = images.slice(1);

      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          featured_image,
          images: additionalImages.length > 0 ? JSON.stringify(additionalImages) : null,
          status: publishNow ? 'published' : formData.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('dashboard.errorOccurred'));
      }

      router.push('/dashboard/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dashboard.errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('dashboard.confirmDeletePost'))) return;

    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/blog');
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
            <Link href="/dashboard/blog" className={styles.backLink}>
              <ArrowIcon />
              {t('dashboard.backToBlog')}
            </Link>
            <h1>{t('dashboard.editPost')}</h1>
          </div>
          <button onClick={handleDelete} className="btn btn-danger">
            <FiTrash2 />
            {t('dashboard.delete')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formCard}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.blog.title')} *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.input}
              placeholder={t('dashboard.blog.titlePlaceholder')}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.blog.excerpt')}</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              className={styles.textarea}
              placeholder={t('dashboard.blog.excerptPlaceholderEdit')}
              rows={3}
            />
          </div>

          {/* Image Uploader */}
          <ImageUploader
            images={images}
            onChange={setImages}
            folder="blog"
            maxImages={10}
            label={t('dashboard.blog.images')}
          />

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.blog.content')} *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className={styles.textarea}
              placeholder={t('dashboard.blog.contentPlaceholder')}
              rows={15}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.blog.status')}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="draft">{t('dashboard.status.draft')}</option>
              <option value="published">{t('dashboard.status.published')}</option>
              <option value="archived">{t('dashboard.status.archived')}</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.blog.seoTitle')}</label>
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
              className={styles.input}
              placeholder={t('dashboard.blog.seoTitlePlaceholderEdit')}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('dashboard.blog.seoDescription')}</label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              className={styles.textarea}
              placeholder={t('dashboard.blog.seoDescriptionPlaceholderEdit')}
              rows={2}
            />
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
