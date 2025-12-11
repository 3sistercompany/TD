'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiCalendar, FiUser, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useLanguage } from '@/lib/i18n';
import styles from './page.module.css';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string;
  views: number;
}

interface TranslatedPost extends BlogPost {
  translatedTitle?: string;
  translatedExcerpt?: string;
}

export default function BlogPage() {
  const { t, language, isRTL } = useLanguage();
  const [posts, setPosts] = useState<TranslatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const gregorian = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(date);
    const islamic = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(date);
    return `${gregorian} | ${islamic}`;
  };

  const translatePost = useCallback(async (post: BlogPost): Promise<TranslatedPost> => {
    if (language === 'ar') {
      return { ...post, translatedTitle: post.title, translatedExcerpt: post.excerpt };
    }
    
    try {
      const [titleRes, excerptRes] = await Promise.all([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: post.title, targetLang: 'en', sourceLang: 'ar' }),
        }),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: post.excerpt, targetLang: 'en', sourceLang: 'ar' }),
        }),
      ]);

      const titleData = await titleRes.json();
      const excerptData = await excerptRes.json();

      return {
        ...post,
        translatedTitle: titleData.translatedText || post.title,
        translatedExcerpt: excerptData.translatedText || post.excerpt,
      };
    } catch (error) {
      console.error('Translation error:', error);
      return { ...post, translatedTitle: post.title, translatedExcerpt: post.excerpt };
    }
  }, [language]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/blog?limit=20', { cache: 'no-store' });
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
          
          // Translate if English is selected
          if (language === 'en') {
            setTranslating(true);
            const translatedPosts = await Promise.all(
              data.posts.map((post: BlogPost) => translatePost(post))
            );
            setPosts(translatedPosts);
            setTranslating(false);
          }
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [language, translatePost]);

  const ArrowIcon = isRTL ? FiArrowLeft : FiArrowRight;

  return (
    <div className={styles.blogPage}>
      <section className={styles.hero}>
        <div className="container">
          <h1>{t('blog.title')}</h1>
          <p>{t('blog.subtitle')}</p>
        </div>
      </section>
      <section className={styles.blogSection}>
        <div className="container">
          {loading ? (
            <div className={styles.loading}>{t('common.loading')}</div>
          ) : posts.length === 0 ? (
            <div className={styles.loading}>{language === 'ar' ? 'لا توجد مقالات بعد' : 'No articles yet'}</div>
          ) : (
            <>
              {translating && (
                <div className={styles.translatingBanner}>
                  {language === 'ar' ? 'جاري الترجمة...' : 'Translating...'}
                </div>
              )}
              <div className={styles.blogGrid}>
                {posts.map((post) => (
                  <article key={post.id} className={styles.blogCard}>
                    <div className={styles.blogImage}>
                      {post.featured_image ? (
                        <img src={post.featured_image} alt={post.translatedTitle || post.title} />
                      ) : (
                        <span className={styles.category}>{t('blog.article')}</span>
                      )}
                    </div>
                    <div className={styles.blogContent}>
                      <h2 className={styles.blogTitle}>
                        <Link href={`/blog/${post.slug}`}>{post.translatedTitle || post.title}</Link>
                      </h2>
                      <p className={styles.blogExcerpt}>{post.translatedExcerpt || post.excerpt}</p>
                      <div className={styles.blogMeta}>
                        <span className={styles.metaItem}>
                          <FiUser />
                          {t('blog.author')}
                        </span>
                        <span className={styles.metaItem}>
                          <FiCalendar />
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                      <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                        {t('blog.readMore')}
                        <ArrowIcon />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
