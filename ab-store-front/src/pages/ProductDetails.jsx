import { Heart, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import ProductOptionPicker from '../components/product/ProductOptionPicker';
import { useCatalog } from '../context/catalog';
import { useLanguage } from '../context/language';
import { useStore } from '../context/store';
import { useToast } from '../context/toast';
import { getProductPrice } from '../data/products';
import { getOptionGroupLabel, getMissingOptions, parseProductOptions } from '../utils/productOptions';

export default function ProductDetails() {
  const { id } = useParams();
  const { products } = useCatalog();
  const { t } = useLanguage();
  const product = products.find((item) => item.id === Number(id));

  const allImages = useMemo(() => {
    if (!product) return [];
    const images = [];
    if (product.image) images.push(product.image);
    if (product.image2) images.push(product.image2);
    if (product.galleryImages && product.galleryImages.length > 0) {
      images.push(...product.galleryImages);
    }
    return images.filter(Boolean);
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const { toast } = useToast();

  const optionGroups = parseProductOptions(product?.options);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (item) => item.category === product.category && item.id !== product.id
      )
      .slice(0, 4);
  }, [product, products]);

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-28 text-center md:pt-36">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {t('productNotFound')}
        </h1>
        <Link
          to="/catalog"
          className="mt-6 inline-flex rounded-lg bg-gold px-6 py-3 font-semibold text-black"
        >
          {t('backToCatalog')}
        </Link>
      </main>
    );
  }

  const price = getProductPrice(product);
  const isFav = wishlist.includes(product.id);
  const hasPromoDiscount =
    product.isPromo && Number(product.discountPercent) > 0;

  const missingOptions = getMissingOptions(optionGroups, selectedOptions);

  const handleOptionSelect = (groupName, value) => {
    setSelectedOptions((current) => ({
      ...current,
      [groupName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (missingOptions.length > 0) {
      toast({
        type: 'danger',
        title: t('selectAllOptions'),
        message: missingOptions.map((group) => getOptionGroupLabel(group.name, t)).join(', '),
      });
      return;
    }

    addToCart(product.id, quantity, selectedOptions);
    toast({
      type: 'success',
      title: t('addedToCart'),
      message: `${quantity} x ${product.name}`,
    });
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    toast({
      type: isFav ? 'info' : 'success',
      title: isFav ? t('removedFromWishlist') : t('addedToWishlist'),
      message: product.name,
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-28 md:pb-20 md:pt-36">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl bg-card border border-border">
            <img
              src={allImages[selectedImage] || product.image}
              alt={product.name}
              className="h-72 w-full object-cover sm:h-[460px] lg:h-[560px] transition-opacity duration-300"
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index ? 'border-gold opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <section className="flex flex-col justify-center">
          <p className="font-semibold text-gold">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-2">
            <Star size={18} className="fill-gold text-gold" />
            <span className="font-medium">{product.rating}</span>
            <span className="text-muted">/ 5</span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-muted sm:mt-6 sm:text-lg">
            {product.description}
          </p>

          {optionGroups.length > 0 && (
            <div className="mt-6">
              <ProductOptionPicker
                t={t}
                optionGroups={optionGroups}
                selectedOptions={selectedOptions}
                onSelect={handleOptionSelect}
              />
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:mt-8">
            {hasPromoDiscount && (
              <span className="text-base text-gray-400 line-through sm:text-lg">
                {product.price.toLocaleString()} DZD
              </span>
            )}
            <span className="text-3xl font-bold text-gold sm:text-4xl">
              {Math.round(price).toLocaleString()} DZD
            </span>
          </div>

          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
            <div className="flex h-12 w-full items-center justify-between rounded-lg border border-border sm:w-auto sm:justify-start">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
                className="flex h-full w-12 items-center justify-center"
                aria-label={t('decreaseQuantity')}
              >
                <Minus size={18} />
              </button>
              <span className="min-w-10 text-center font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="flex h-full w-12 items-center justify-center"
                aria-label={t('increaseQuantity')}
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 font-semibold text-black transition hover:bg-yellow-600 sm:w-auto"
            >
              <ShoppingCart size={18} />
              {t('addToCart')}
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              className={`flex h-12 w-full items-center justify-center rounded-lg border border-border sm:w-12 ${
                isFav ? 'bg-red-50 text-red-500' : 'hover:text-gold'
              }`}
              aria-label={t('wishlist')}
            >
              <Heart size={20} className={isFav ? 'fill-red-500' : ''} />
            </button>
          </div>
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16 md:mt-20">
          <div className="mb-8 flex items-center gap-3 sm:gap-4">
            <span className="h-px flex-1 bg-gray-300"></span>
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              {t('relatedProducts')}
            </h2>
            <span className="h-px flex-1 bg-gray-300"></span>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </main>
  );
}
