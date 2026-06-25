import ProductCard from './ProductCard';
import { useLanguage } from '../../context/language';

export default function ProductGrid({ products }) {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('noProducts')}</h2>
        <p className="mt-2 text-muted">{t('noProductsText')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
