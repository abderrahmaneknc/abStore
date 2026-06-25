import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/language';

export default function Hero() {
  const { t } = useLanguage();

  const scrollToInfo = () => {
    const el = document.getElementById('info');
    if (!el) return;

    const offset = 100;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    });
  };

  return (
<section className="relative min-h-[500px] h-[75svh] flex items-center justify-center md:h-[70vh]">     
         <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover"
      >
        <source src="/iphone.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 text-center max-w-3xl px-4 pt-20 sm:px-6 md:pt-28">
        <Motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold leading-tight text-white/90 sm:text-5xl md:text-6xl"
        >
          {t('heroTitle')}
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base"
        >
          {t('heroText')}
        </Motion.p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/catalog"
            className="rounded-lg bg-gold px-6 py-3 text-center font-semibold text-black transition hover:bg-yellow-500"
          >
            {t('buy')}
          </Link>

          <button
            type="button"
            onClick={scrollToInfo}
            className="rounded-lg border border-gold px-6 py-3 font-semibold text-white/90 transition hover:bg-gold hover:text-black"
          >
            {t('moreInfo')}
          </button>
        </div>
      </div>
    </section>
  );
}
