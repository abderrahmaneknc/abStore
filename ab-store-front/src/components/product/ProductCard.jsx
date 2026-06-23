import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/language';
import { useStore } from '../../context/store';
import { useToast } from '../../context/toast';
import { getProductPrice } from '../../data/products';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const { t } = useLanguage();
  const { toast } = useToast();
  const isFav = wishlist.includes(product.id);
  const discount = Number(product.discountPercent) || 0;
  const price = getProductPrice(product);
  const hasPromoDiscount = product.isPromo && discount > 0;

  const handleWishlist = () => {
    toggleWishlist(product.id);
    toast({
      type: isFav ? 'info' : 'success',
      title: isFav ? t('removedFromWishlist') : t('addedToWishlist'),
      message: product.name,
    });
  };

  const handleAddToCart = () => {
    addToCart(product.id);
    toast({
      type: 'success',
      title: t('addedToCart'),
      message: product.name,
    });
  };

  return (
    <Motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-card border border-border rounded-xl overflow-hidden group shadow-sm"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <div className="relative h-56 w-full sm:h-60 group">
            <img
              src={product.image}
              alt={product.name}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${product.image2 ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
            />
            {product.image2 && (
              <img
                src={product.image2}
                alt={`${product.name} alternate`}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </div>

          {hasPromoDiscount && (
            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-sm text-muted">{product.brand}</p>

        <Link to={`/product/${product.id}`}>
          <h3 className="mt-1 min-h-12 font-semibold leading-6 transition hover:text-gold">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          <Star size={16} className="text-gold fill-gold" />
          <span className="text-sm">{product.rating || 4.6}</span>
        </div>

        <div className="mt-3">
          {hasPromoDiscount && (
            <span className="mr-2 text-sm text-gray-400 line-through">
              {product.price.toLocaleString()} DZD
            </span>
          )}
          <span className="text-lg font-bold text-gold">
            {Math.round(price).toLocaleString()} DZD
          </span>
        </div>

        <div className="mt-4 grid grid-cols-[44px_1fr] gap-2">
          <button
            type="button"
            onClick={handleWishlist}
            className={`flex h-11 items-center justify-center rounded-lg border border-border transition ${
              isFav ? 'bg-red-50 text-red-500' : 'bg-white hover:text-gold'
            }`}
            aria-label={t('wishlist')}
          >
            <Heart size={18} className={isFav ? 'fill-red-500' : ''} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-gold px-3 font-semibold text-black transition hover:bg-yellow-600"
          >
            <ShoppingCart size={18} />
            {t('add')}
          </button>
        </div>
      </div>
    </Motion.div>
  );
}
