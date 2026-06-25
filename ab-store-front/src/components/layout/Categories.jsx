import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/catalog';
import { useLanguage } from '../../context/language';

const fallbackImage =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop&q=80';

const CARD_CLASS =
  'flex h-[220px] w-[150px] shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-white shadow-md transition duration-300 group hover:shadow-xl sm:h-[240px] sm:w-[180px] md:h-[260px] md:w-[220px]';

export default function Categories() {
  const { t } = useLanguage();
  const { visibleCategories } = useCatalog();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isScrollable = visibleCategories.length > 3;
  const useCarousel = visibleCategories.length > 1;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return undefined;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [visibleCategories.length, updateScrollState]);

  const scrollByCard = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('a')?.offsetWidth || 180;
    el.scrollBy({ left: direction * (cardWidth + 12), behavior: 'smooth' });
  };

  const renderCard = (cat) => (
    <Link
      to={`/catalog?category=${encodeURIComponent(cat.name)}`}
      key={cat.id}
      className={CARD_CLASS}
    >
      <div className="h-[110px] shrink-0 overflow-hidden sm:h-[120px] md:h-[140px]">
        <img
          src={cat.image || fallbackImage}
          alt={cat.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-between p-3">
        <h3 className="line-clamp-2 text-center text-sm font-bold text-gray-800 sm:text-base">
          {cat.name}
        </h3>

        <span className="rounded-lg bg-yellow-500 px-4 py-1.5 text-xs font-semibold text-white transition group-hover:bg-yellow-600 sm:text-sm">
          {t('buy')}
        </span>
      </div>
    </Link>
  );

  return (
    <section className="px-4 py-12 bg-gray-900 sm:px-6 sm:py-16">
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10">
        <div className="flex items-center gap-3 w-full sm:gap-4">
          <span className="flex-1 h-px bg-gray-500" />
          <h2 className="text-3xl font-bold text-white text-center sm:text-5xl">
            {t('ourProducts')}
          </h2>
          <span className="flex-1 h-px bg-gray-500" />
        </div>
      </div>

      {visibleCategories.length === 0 ? (
        <p className="max-w-7xl mx-auto text-center text-gray-400">{t('noCategoriesYet')}</p>
      ) : useCarousel ? (
        <div className="relative max-w-7xl mx-auto">
          {isScrollable && canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-800 shadow-lg transition hover:bg-white sm:p-2"
              aria-label={t('scrollLeft')}
            >
              <ChevronLeft size={20} className="sm:hidden" />
              <ChevronLeft size={22} className="hidden sm:block" />
            </button>
          )}

          {isScrollable && canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-800 shadow-lg transition hover:bg-white sm:p-2"
              aria-label={t('scrollRight')}
            >
              <ChevronRight size={20} className="sm:hidden" />
              <ChevronRight size={22} className="hidden sm:block" />
            </button>
          )}

          {isScrollable && canScrollRight && (
            <div className="pointer-events-none absolute right-0 top-0 z-[1] h-full w-10 bg-gradient-to-l from-gray-900 to-transparent sm:w-16" />
          )}

          <div
            ref={scrollRef}
            className={`flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory sm:gap-4 ${
              isScrollable ? 'px-8 sm:px-10' : 'justify-center'
            }`}
          >
            {visibleCategories.map(renderCard)}
          </div>

          {isScrollable && (
            <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-gray-400 sm:text-sm">
              <ChevronRight size={14} className="animate-pulse" />
              {t('swipeCategories')}
            </p>
          )}
        </div>
      ) : (
        <div className="mx-auto flex max-w-7xl justify-center gap-4">
          {visibleCategories.map(renderCard)}
        </div>
      )}
    </section>
  );
}
