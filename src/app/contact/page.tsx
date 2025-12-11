'use client';

import { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '@/lib/i18n';
import CTA from '@/components/home/CTA';
import styles from './page.module.css';

export default function ContactPage() {
  const { t, language } = useLanguage();
  
  const contactInfo = [
    {
      icon: FiPhone,
      title: t('contact.info.phone'),
      value: '9200 15499',
      href: 'tel:920015499',
    },
    {
      icon: FaWhatsapp,
      title: t('contact.info.whatsapp'),
      value: '9200 15499',
      href: 'https://wa.me/966920015499',
    },
    {
      icon: FiMail,
      title: t('contact.info.email'),
      value: 'info@tdlogistics.co',
      href: 'mailto:info@tdlogistics.co',
    },
    {
      icon: FiMapPin,
      title: t('contact.info.address'),
      value: t('footer.address'),
      href: '#',
    },
    {
      icon: FiClock,
      title: t('contact.info.workingHours'),
      value: t('footer.workingHours'),
      href: '#',
    },
  ];

  const contactTypes = [
    { value: 'general', label: t('contact.types.general') },
    { value: 'sales', label: t('contact.types.sales') },
    { value: 'support', label: t('contact.types.support') },
    { value: 'partnership', label: t('contact.types.partnership') },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'general',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = t('validation.nameRequired');
    if (!formData.email.trim()) newErrors.email = t('validation.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }
    if (!formData.subject.trim()) newErrors.subject = t('validation.subjectRequired');
    if (!formData.message.trim()) newErrors.message = t('validation.messageRequired');
    else if (formData.message.length < 10) {
      newErrors.message = t('validation.messageMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('common.error'));
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        type: 'general',
        subject: '',
        message: '',
      });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className={styles.content}>
        <div className="container">
          <div className={styles.grid}>
            {/* Contact Info */}
            <div className={styles.infoSection}>
              <h2>{t('contact.info.title')}</h2>
              <p className={styles.infoDesc}>
                {t('contact.info.description')}
              </p>

              <div className={styles.infoList}>
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className={styles.infoItem}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <div className={styles.infoIcon}>
                      <item.icon />
                    </div>
                    <div>
                      <span className={styles.infoTitle}>{item.title}</span>
                      <span className={styles.infoValue}>{item.value}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className={styles.formSection}>
              <h2>{t('contact.form.title')}</h2>
              
              {submitStatus === 'success' ? (
                <div className={styles.successMessage}>
                  <FiCheck className={styles.successIcon} />
                  <h3>{t('contact.form.success')}</h3>
                  <p>{t('contact.form.successDesc')}</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setSubmitStatus('idle')}
                  >
                    {t('contact.form.sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">{t('contact.form.name')} *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`input ${errors.name ? 'input-error' : ''}`}
                        placeholder={t('contact.form.namePlaceholder')}
                        maxLength={100}
                      />
                      {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('contact.form.email')} *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input ${errors.email ? 'input-error' : ''}`}
                        placeholder={t('contact.form.emailPlaceholder')}
                        maxLength={255}
                        dir="ltr"
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">{t('contact.form.phone')}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input"
                        placeholder={t('contact.form.phonePlaceholder')}
                        maxLength={15}
                        dir="ltr"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('contact.form.company')}</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="input"
                        placeholder={t('contact.form.companyPlaceholder')}
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">{t('contact.form.type')}</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="input"
                      >
                        {contactTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('contact.form.subject')} *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`input ${errors.subject ? 'input-error' : ''}`}
                        placeholder={t('contact.form.subjectPlaceholder')}
                        maxLength={200}
                      />
                      {errors.subject && <span className="error-message">{errors.subject}</span>}
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">{t('contact.form.message')} *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`input ${errors.message ? 'input-error' : ''}`}
                      placeholder={t('contact.form.messagePlaceholder')}
                      rows={5}
                      maxLength={5000}
                    />
                    {errors.message && <span className="error-message">{errors.message}</span>}
                  </div>

                  {submitStatus === 'error' && (
                    <div className={styles.errorAlert}>
                      {t('contact.form.error')}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="spinner"></span>
                    ) : (
                      <>
                        <FiSend />
                        {t('contact.form.submit')}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className={styles.locationSection}>
        <div className={styles.locationGrid}>
          {/* Map - 70% width */}
          <div className={styles.mapWrapper}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.8!2d46.7660758!3d24.8499463!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2eff6e849a1517%3A0xd6d8e8d1761a6350!2sTD%20Logistics%20%7C%20%D8%AA%D9%8A%20%D8%AF%D9%8A%20%D9%84%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D9%84%D9%88%D8%AC%D8%B3%D8%AA%D9%8A%D8%A9!5e0!3m2!1sen!2ssa!4v1234567890!5m2!1sen!2ssa"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="TD Logistics - 3400 Al Thoumamah Rd, RUMB3400, Riyadh 13422"
            ></iframe>
          </div>
          {/* Image - 30% width */}
          <div className={styles.imageWrapper}>
            <img 
              src="/support_map_section.webp" 
              alt="TD Logistics Location" 
              className={styles.locationImg}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTA />
    </div>
  );
}
