import { Headphones, MapPin, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaPhone, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../context/language';
import { useToast } from '../context/toast';
import { contactApi } from '../services/api';
import {
  phoneHref,
  whatsappHref,
  STORE_PHONE_DISPLAY,
} from '../config/storeContact';

function PageShell({ eyebrow, title, children }) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-28 md:pt-36">
      <section className="rounded-xl bg-gray-900 px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-3">{children}</div>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text, children }) {
  const CardIcon = icon;

  return (
    <div className="rounded-xl border border-gray-800 bg-white/5 p-6">
      <CardIcon className="h-9 w-9 text-gold" />
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-300">{text}</p>
      {children}
    </div>
  );
}

export function About() {
  const { t } = useLanguage();

  return (
    <PageShell eyebrow={t('about')} title={t('aboutTitle')}>
      <InfoCard
        icon={Smartphone}
        title={t('selectionPremium')}
        text={t('selectionText')}
      />
      <InfoCard icon={MapPin} title={t('localBase')} text={t('localText')} />
      <InfoCard
        icon={Headphones}
        title={t('usefulAdvice')}
        text={t('usefulAdviceText')}
      />
    </PageShell>
  );
}

export function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phoneOrEmail: '',
    message: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.message.trim()) {
      toast({
        type: 'danger',
        title: 'Error',
        message: t('fieldRequired') || 'This field is required',
      });
      return;
    }

    try {
      await contactApi.submit({
        name: formData.name.trim(),
        phoneOrEmail: formData.phoneOrEmail.trim(),
        message: formData.message.trim(),
      });

      setFormData({ name: '', phoneOrEmail: '', message: '' });
      toast({
        type: 'success',
        title: t('messagePrepared'),
        message: t('messagePreparedText'),
      });
    } catch (error) {
      console.error('Failed to submit contact message', error);
      toast({
        type: 'danger',
        title: t('messagePrepared'),
        message: error.message || 'Unable to send your message. Please try again later.',
      });
    }
  };

  return (
    <PageShell eyebrow={t('contact')} title={t('contactTitle')}>
      <InfoCard icon={MapPin} title={t('address')} text={t('addressText')} />
      <InfoCard icon={Headphones} title={t('support')} text={t('supportText')}>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={phoneHref}
            className="inline-flex items-center gap-2 text-sm text-gray-200 hover:text-gold transition"
          >
            <FaPhone size={14} />
            {STORE_PHONE_DISPLAY}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-200 hover:text-green-400 transition"
          >
            <FaWhatsapp size={16} />
            {t('whatsappUs')}
          </a>
        </div>
      </InfoCard>
      <div className="rounded-xl border border-gray-800 bg-white/5 p-6">
        <h2 className="text-xl font-bold">{t('quickRequest')}</h2>
        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-700 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gold"
            placeholder={t('name')}
          />
          <input
            name="phoneOrEmail"
            value={formData.phoneOrEmail}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-700 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gold"
            placeholder={t('phoneOrEmail')}
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="min-h-28 w-full rounded-lg border border-gray-700 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gold"
            placeholder={t('message')}
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-gold px-5 py-3 font-semibold text-black transition hover:bg-yellow-600"
          >
            {t('send')}
          </button>
        </form>
      </div>
    </PageShell>
  );
}

export function NotFound() {
  const { t } = useLanguage();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-28 text-center md:pt-36">
      <h1 className="text-3xl font-bold sm:text-4xl">{t('pageNotFound')}</h1>
      <p className="mt-3 text-muted">{t('pageNotFoundText')}</p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-lg bg-gold px-6 py-3 font-semibold text-black"
      >
        {t('backHome')}
      </Link>
    </main>
  );
}
