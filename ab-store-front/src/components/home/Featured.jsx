import { Link } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';
import { getProductPrice } from '../../data/products';
import { useCatalog } from '../../context/catalog';
import { useLanguage } from '../../context/language';
import { useStore } from '../../context/store';
import { useToast } from '../../context/toast';

export default function Featured() {
  const scrollRefNew = useRef();
  const scrollRefPromo = useRef();
  const [isHoveredNew, setIsHoveredNew] = useState(false);
  const [isHoveredPromo, setIsHoveredPromo] = useState(false);
  const { availableProducts: products } = useCatalog();
  const { t } = useLanguage();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const { toast } = useToast();

  const newProducts = useMemo(
    () => products.filter((product) => product.isNew),
    [products]
  );
  const promoProducts = useMemo(
    () => products.filter((product) => product.isPromo),
    [products]
  );

  const scroll = (direction, ref) => {
    const container = ref.current;
    if (!container) return;

    container.scrollBy({
      left:
        direction === 'left' ? -container.clientWidth : container.clientWidth,
      behavior: 'smooth',
    });
  };

  const handleWishlist = (product, isFav) => {
    toggleWishlist(product.id);
    toast({
      type: isFav ? 'info' : 'success',
      title: isFav ? t('removedFromWishlist') : t('addedToWishlist'),
      message: product.name,
    });
  };

  const handleAddToCart = (product) => {
    addToCart(product.id);
    toast({
      type: 'success',
      title: t('addedToCart'),
      message: product.name,
    });
  };

  const renderSection = ({
    title,
    data,
    scrollRef,
    isHovered,
    setIsHovered,
    isPromo = false,
  }) => {
    if (data.length === 0) return null;

    const showArrows = data.length > 3;

    return (
      <section
        className="py-12 bg-white sm:py-16"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex-1 h-px bg-gray-300"></span>
            <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-5xl">
              {title}
            </h2>
            <span className="flex-1 h-px bg-gray-300"></span>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {showArrows && (
            <>
              <button
                type="button"
                onClick={() => scroll('left', scrollRef)}
                className="hidden md:flex absolute left-0 top-0 z-20 h-full w-12 items-center justify-center bg-white/70 backdrop-blur-md transition-opacity"
                style={{ opacity: isHovered ? 0.9 : 0 }}
                aria-label="Defiler a gauche"
              >
                <ChevronLeft size={40} />
              </button>

              <button
                type="button"
                onClick={() => scroll('right', scrollRef)}
                className="hidden md:flex absolute right-0 top-0 z-20 h-full w-12 items-center justify-center bg-white/70 backdrop-blur-md transition-opacity"
                style={{ opacity: isHovered ? 0.9 : 0 }}
                aria-label="Defiler a droite"
              >
                <ChevronRight size={40} />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex snap-x gap-4 overflow-x-auto pb-4 scrollbar-hide sm:gap-6"
          >
            {data.map((product) => {
              const discount = Number(product.discountPercent) || 0;
              const hasPromoDiscount = isPromo && discount > 0;
              const price = getProductPrice(product);
              const isFav = wishlist.includes(product.id);

              return (
                <article
                  key={product.id}
                  className="flex-shrink-0 snap-start basis-[82vw] overflow-hidden rounded-xl bg-card shadow-md transition hover:scale-[1.02] sm:basis-[300px] md:basis-[calc((100%_-_24px)/2)] lg:basis-[calc((100%_-_72px)/4)]"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative h-52 overflow-hidden sm:h-56">
                      {hasPromoDiscount ? (
                        <>
                          <span className="absolute top-3 left-3 z-10 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase shadow-md">
                            {t('promo')}
                          </span>
                          <span className="absolute top-12 left-3 z-10 bg-red-600 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-lg">
                            -{discount}%
                          </span>
                        </>
                      ) : (
                        <span className="absolute top-3 left-3 z-10 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase shadow-md">
                          {t('new')}
                        </span>
                      )}

                      <div className="relative h-52 w-full sm:h-56 group/img">
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${product.image2 ? 'group-hover/img:opacity-0' : 'hover:scale-105'}`}
                        />
                        {product.image2 && (
                          <img
                            src={product.image2}
                            alt={`${product.name} alternate`}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover/img:opacity-100"
                          />
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="min-h-12 text-center font-bold leading-6 hover:text-gold">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-2 text-sm text-gray-500 text-center line-clamp-2">
                      {product.description}
                    </p>

                    <div className="mt-3 text-center">
                      {hasPromoDiscount && (
                        <p className="line-through text-gray-400 text-sm">
                          {product.price.toLocaleString()} DZD
                        </p>
                      )}
                      <p
                        className={`font-bold text-lg ${
                          isPromo ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {Math.round(price).toLocaleString()} DZD
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-[44px_1fr] gap-2">
                      <button
                        type="button"
                        onClick={() => handleWishlist(product, isFav)}
                        className={`flex h-11 items-center justify-center rounded-lg border border-border transition ${
                          isFav
                            ? 'bg-red-50 text-red-500'
                            : 'bg-white hover:text-gold'
                        }`}
                        aria-label={t('wishlist')}
                      >
                        <Heart
                          size={18}
                          className={isFav ? 'fill-red-500' : ''}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-gold px-3 font-semibold text-black transition hover:bg-yellow-600"
                      >
                        <ShoppingCart size={18} />
                        {t('add')}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      {renderSection({
        title: t('featured'),
        data: newProducts,
        scrollRef: scrollRefNew,
        isHovered: isHoveredNew,
        setIsHovered: setIsHoveredNew,
      })}

      {renderSection({
        title: t('promotions'),
        data: promoProducts,
        scrollRef: scrollRefPromo,
        isHovered: isHoveredPromo,
        setIsHovered: setIsHoveredPromo,
        isPromo: true,
      })}
    </>
  );
}
