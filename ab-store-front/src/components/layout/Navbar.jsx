import { ChevronLeft, ChevronRight, Globe2, Heart, Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../context/catalog';
import { useLanguage } from '../../context/language';
import { useStore } from '../../context/store';
import { getProductPrice } from '../../data/products';
import logo from '../../assets/the_phone_house.jpg';

function useHorizontalScroll(deps = []) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [updateScrollState, ...deps]);

  const scrollByStep = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 160, behavior: 'smooth' });
  };

  return { scrollRef, canScrollLeft, canScrollRight, scrollByStep, updateScrollState };
}

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const { availableProducts: products, visibleCategories } = useCatalog();
  const { cartCount, wishlistCount } = useStore();
  const { language, languages, setLanguage, t } = useLanguage();

  const baseLinks = useMemo(
    () => [
      { label: t('home'), to: '/' },
      { label: t('shop'), to: '/catalog' },
      { label: t('about'), to: '/about' },
      { label: t('contact'), to: '/contact' },
    ],
    [t]
  );

  const categoryLinks = useMemo(
    () =>
      visibleCategories.map((category) => ({
        label: category.name,
        to: `/catalog?category=${encodeURIComponent(category.name)}`,
      })),
    [visibleCategories]
  );

  const feedbackLink = useMemo(
    () => ({ label: t('shareExperience'), to: '/#feedback-section', isHash: true }),
    [t]
  );

  const isCategoryScrollable = categoryLinks.length > 3;

  const desktopCategories = useHorizontalScroll([categoryLinks.length]);
  const mobileCategories = useHorizontalScroll([categoryLinks.length, isOpen]);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return products
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(normalized) ||
          product.brand.toLowerCase().includes(normalized) ||
          product.category.toLowerCase().includes(normalized)
        );
      })
      .slice(0, 5);
  }, [products, query]);

  const submitSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set('search', query.trim());
    }

    navigate(`/catalog${params.toString() ? `?${params.toString()}` : ''}`);
    setIsOpen(false);
    setIsSearchFocused(false);
  };

  const openSuggestion = (product) => {
    navigate(`/product/${product.id}`);
    setQuery('');
    setIsOpen(false);
    setIsSearchFocused(false);
  };

  const scrollToFeedback = () => {
    setIsOpen(false);
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('feedback-section');
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById('feedback-section');
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const renderSearchBox = (mobile = false) => (
    <div className="relative w-full">
      <form
        onSubmit={submitSearch}
        className={`flex items-center rounded-lg border bg-white px-3 py-2.5 ${
          mobile ? 'border-gray-700' : 'border-border'
        }`}
      >
        <Search size={16} />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={query}
          onFocus={() => setIsSearchFocused(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsSearchFocused(true);
          }}
          className="ml-2 w-full outline-none text-gray-900"
        />
      </form>

      {isSearchFocused && query.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-xl border border-border bg-white shadow-xl">
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => openSuggestion(product)}
                  className="grid w-full grid-cols-[54px_1fr] items-center gap-3 px-3 py-3 text-left hover:bg-gray-50"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-gray-900">
                      {product.name}
                    </span>
                    <span className="block text-sm text-muted">
                      {product.brand} -{' '}
                      {Math.round(getProductPrice(product)).toLocaleString()}{' '}
                      DZD
                    </span>
                  </span>
                </button>
              ))}
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  navigate(`/catalog?search=${encodeURIComponent(query)}`);
                  setIsSearchFocused(false);
                  setIsOpen(false);
                }}
                className="w-full border-t border-border px-4 py-3 text-sm font-semibold text-gold hover:bg-gray-50"
              >
                {t('viewAllResults')}
              </button>
            </>
          ) : (
            <div className="px-4 py-4 text-sm text-muted">
              {t('noSearchResults')}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const navLinkClass = (link, mobileChip = false) =>
    ({ isActive }) =>
      `${
        mobileChip
          ? 'rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium'
          : 'rounded-lg px-3 py-2 text-sm'
      } whitespace-nowrap transition hover:bg-white/10 hover:text-gold shrink-0 ${
        isActive && link.to === '/catalog' ? 'text-gold' : ''
      }`;

  const renderStandardLink = (link, mobileChip = false) => (
    <NavLink
      key={`${link.label}-${link.to}`}
      to={link.to}
      onClick={() => {
        setIsOpen(false);
        window.scrollTo(0, 0);
      }}
      className={navLinkClass(link, mobileChip)}
    >
      {link.label}
    </NavLink>
  );

  const renderFeedbackButton = (className = '') => (
    <button
      key={`${feedbackLink.label}-hash`}
      type="button"
      onClick={scrollToFeedback}
      className={`rounded-lg px-3 py-2 text-sm whitespace-nowrap transition hover:bg-white/10 hover:text-gold text-left shrink-0 ${className}`}
    >
      {feedbackLink.label}
    </button>
  );

  const renderDesktopCategoryScroll = () => (
    <div className="relative min-w-0 flex-1">
      {isCategoryScrollable && desktopCategories.canScrollLeft && (
        <button
          type="button"
          onClick={() => desktopCategories.scrollByStep(-1)}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-1 text-white transition hover:bg-white/20"
          aria-label={t('scrollLeft')}
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {isCategoryScrollable && desktopCategories.canScrollRight && (
        <button
          type="button"
          onClick={() => desktopCategories.scrollByStep(1)}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-1 text-white transition hover:bg-white/20"
          aria-label={t('scrollRight')}
        >
          <ChevronRight size={18} />
        </button>
      )}

      {isCategoryScrollable && desktopCategories.canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 z-[1] h-full w-10 bg-gradient-to-l from-gray-900 to-transparent" />
      )}

      <div
        ref={desktopCategories.scrollRef}
        className={`flex items-center gap-2 overflow-x-auto scrollbar-hide ${
          isCategoryScrollable ? 'px-7' : ''
        }`}
      >
        {categoryLinks.map((link) => renderStandardLink(link))}
      </div>
    </div>
  );

  const renderMobileCategoryScroll = () => (
    <div className="mt-2">
      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {t('categoriesTab')}
      </p>

      <div className="relative mt-2">
        {isCategoryScrollable && mobileCategories.canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-[1] h-full w-8 bg-gradient-to-l from-gray-900 to-transparent" />
        )}

        <div
          ref={mobileCategories.scrollRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory"
        >
          {categoryLinks.map((link) => renderStandardLink(link, true))}
        </div>

        {isCategoryScrollable && (
          <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-gray-400">
            <ChevronRight size={12} className="animate-pulse" />
            {t('swipeCategories')}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src={logo} alt="The Phone House" className="h-8 w-auto rounded" />
          <span className="font-semibold whitespace-nowrap">The Phone House</span>
        </Link>

        <div className="hidden w-full max-w-xl lg:block">
          {renderSearchBox()}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 rounded-lg border border-border px-2 py-1 md:flex">
            <Globe2 size={16} className="text-muted" />
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="bg-transparent text-sm font-semibold outline-none"
              aria-label="Language"
            >
              {languages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/wishlist"
            className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-gray-100 hover:text-gold"
            aria-label={t('wishlist')}
          >
            <Heart size={21} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-gold px-1 text-center text-xs font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-gray-100 hover:text-gold"
            aria-label={t('cart')}
          >
            <ShoppingCart size={21} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-gold px-1 text-center text-xs font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg md:hidden hover:bg-gray-100"
            onClick={() => setIsOpen((current) => !current)}
            aria-label="Menu"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <nav className="border-t border-border bg-gray-900">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 py-3 md:block ${
            isOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="mb-3 lg:hidden">{renderSearchBox(true)}</div>

          <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-white md:hidden">
            <Globe2 size={16} />
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full bg-gray-900 text-sm font-semibold outline-none"
              aria-label="Language"
            >
              {languages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile menu: vertical main links + horizontal category chips */}
          <div className="flex flex-col gap-2 text-white md:hidden">
            {baseLinks.map((link) => renderStandardLink(link))}
            {categoryLinks.length > 0 && renderMobileCategoryScroll()}
            {renderFeedbackButton()}
          </div>

          {/* Desktop menu: row with scrollable categories when many */}
          <div className="hidden md:flex md:items-center md:gap-2 lg:gap-4 text-sm text-white">
            {baseLinks.map((link) => renderStandardLink(link))}

            {categoryLinks.length > 0 &&
              (isCategoryScrollable
                ? renderDesktopCategoryScroll()
                : categoryLinks.map((link) => renderStandardLink(link)))}

            {renderFeedbackButton()}
          </div>
        </div>
      </nav>
    </header>
  );
}
