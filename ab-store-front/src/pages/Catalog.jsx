import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { useCatalog } from '../context/catalog';
import { useLanguage } from '../context/language';
import { productApi, categoryApi } from '../services/api';
import { parseProductOptions } from '../utils/productOptions';

const normalizeBackendProduct = (product) => {
  const frontImage = product.images?.find((image) => image.type === 'FRONT')?.url;
  const backImage = product.images?.find((image) => image.type === 'BACK')?.url;
  const galleryImages = product.images?.filter((image) => image.type === 'GALLERY')?.map(img => img.url) || [];

  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category?.name || '',
    description: product.description,
    price: Number(product.price) || 0,
    rating: Number(product.rating) || 4.5,
    isNew: Boolean(product.isNew),
    isPromo: Boolean(product.isPromotion),
    image: frontImage || '',
    image2: backImage || '',
    galleryImages: galleryImages,
    stock: Number(product.stockQty) || 0,
    quantity: Number(product.stockQty) || 0,
    discountPercent: Number(product.discountPercent) || 0,
    options: parseProductOptions(product.options),
  };
};

export default function Catalog() {
  const { t } = useLanguage();
  const { availableProducts: fallbackProducts } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendCategories, setBackendCategories] = useState([]);
  
  const search = searchParams.get('search') || '';
  const brand = searchParams.get('brand') || 'all';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'none';

  // Build available brands and categories from all products (fallback to local data)
  const brands = useMemo(
    () => ['all', ...new Set(fallbackProducts.map((product) => product.brand).filter(Boolean))],
    [fallbackProducts]
  );
  const categories = useMemo(
    () => ['all', ...new Set(fallbackProducts.map((product) => product.category).filter(Boolean))],
    [fallbackProducts]
  );

  // Fetch backend categories to map names to IDs
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoryApi.getAllAdmin();
        setBackendCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (!value || value === 'all' || value === 'none') {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setSearchParams(next);
  };

  // Helper to get category ID by name
  const getCategoryIdByName = (categoryName) => {
    if (!categoryName || categoryName === 'all') return null;
    const cat = backendCategories.find(c => c.name === categoryName);
    return cat?.id;
  };

  // Fetch filtered products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: 0,
          size: 100,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (brand !== 'all' && brand) {
          params.brand = brand;
        }

        // Map category name to ID for backend API
        const categoryId = getCategoryIdByName(category);
        if (categoryId) {
          params.categoryId = categoryId;
        }

        const response = await productApi.search(params);
        let fetchedProducts = Array.isArray(response) ? response : response?.content ?? [];
        
        // Normalize backend products
        fetchedProducts = fetchedProducts.map(normalizeBackendProduct);

        // Apply sorting on frontend
        if (sort === 'price_asc') {
          fetchedProducts = [...fetchedProducts].sort((a, b) => a.price - b.price);
        } else if (sort === 'price_desc') {
          fetchedProducts = [...fetchedProducts].sort((a, b) => b.price - a.price);
        }

        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.message);
        // Fallback to local products if API fails
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, brand, category, sort, backendCategories, fallbackProducts]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-28 md:pb-20 md:pt-36">
      <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            {t('catalog')}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            {t('catalogTitle')}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <SlidersHorizontal size={18} />
          <span>
            {loading ? '...' : `${products.length} ${t('productCount')}`}
          </span>
        </div>
      </div>

      <div className="mb-8 grid gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 md:mb-10 md:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          value={search}
          placeholder={t('searchProduct')}
          className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-gold"
          onChange={(event) => updateParam('search', event.target.value)}
        />

        <select
          value={category}
          className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-gold"
          onChange={(event) => updateParam('category', event.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === 'all' ? t('allCategories') : item}
            </option>
          ))}
        </select>

        <select
          value={brand}
          className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-gold"
          onChange={(event) => updateParam('brand', event.target.value)}
        >
          {brands.map((item) => (
            <option key={item} value={item}>
              {item === 'all' ? t('allBrands') : item}
            </option>
          ))}
        </select>

        <select
          value={sort}
          className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-gold"
          onChange={(event) => updateParam('sort', event.target.value)}
        >
          <option value="none">{t('sortBy')}</option>
          <option value="price_asc">{t('priceLowHigh')}</option>
          <option value="price_desc">{t('priceHighLow')}</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          {error}
        </div>
      )}

      <ProductGrid products={products} />
    </main>
  );
}
