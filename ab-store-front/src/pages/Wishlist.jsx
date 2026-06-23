import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { useLanguage } from '../context/language';
import { useStore } from '../context/store';

export default function Wishlist() {
  const { t } = useLanguage();
  const { wishlistItems } = useStore();

  if (wishlistItems.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-28 text-center md:pt-36">
        <Heart className="mx-auto h-14 w-14 text-gold" />
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          {t('wishlistEmpty')}
        </h1>
        <p className="mt-3 text-muted">{t('wishlistEmptyText')}</p>
        <Link
          to="/catalog"
          className="mt-8 inline-flex rounded-lg bg-gold px-6 py-3 font-semibold text-black"
        >
          {t('exploreProducts')}
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-28 md:pb-20 md:pt-36">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          {t('wishlist')}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          {t('wishlistTitle')}
        </h1>
      </div>
      <ProductGrid products={wishlistItems} />
    </main>
  );
}
