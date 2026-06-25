import { useCallback, useEffect, useMemo, useState } from 'react';
import defaultProducts from '../data/products';
import { categoryApi, productApi } from '../services/api';
import { CatalogContext } from './catalog';
import { parseProductOptions, serializeProductOptions } from '../utils/productOptions';

const storageKey = 'ab-store-products';
const categoryStorageKey = 'ab-store-categories';

const baseCategories = [];

const makeCategoryId = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
  String(Date.now());

const normalizeCategory = (category) => {
  if (typeof category === 'string') {
    const baseCategory = baseCategories.find((item) => item.name === category);
    return {
      id: baseCategory?.id || makeCategoryId(category),
      name: category,
      image: baseCategory?.image || '',
      visible: true,
      imageFile: null,
    };
  }

  const name = category?.name?.trim() || '';
  const baseCategory = baseCategories.find((item) => item.name === name);

  return {
    id: category?.id || baseCategory?.id || makeCategoryId(name),
    name,
    image: category?.image || category?.imageUrl || baseCategory?.image || '',
    visible: category?.visible ?? true,
    imageFile: category?.imageFile || null,
  };
};

const normalizeProduct = (product) => ({
  ...product,
  quantity: Number(product.quantity ?? product.stock ?? product.stockQty ?? 12),
  sold: Number(product.sold ?? 0),
  price: Number(product.price) || 0,
  rating: Number(product.rating) || 4.5,
  discountPercent: Number(product.discountPercent ?? product.discount) || 0,
  isNew: Boolean(product.isNew),
  isPromo: Boolean(product.isPromo ?? product.isPromotion),
});

const normalizeBackendProduct = (product) => {
  const frontImage = product.images?.find((image) => image.type === 'FRONT')?.url;
  const backImage = product.images?.find((image) => image.type === 'BACK')?.url;
  const galleryImages = product.images?.filter((image) => image.type === 'GALLERY')?.map(img => img.url) || [];

  return normalizeProduct({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category?.name || '',
    description: product.description,
    price: product.price,
    rating: product.rating,
    isNew: product.isNew,
    isPromo: product.isPromotion,
    image: frontImage || '',
    image2: backImage || '',
    galleryImages: galleryImages,
    stock: Number(product.stockQty) || 0,
    quantity: Number(product.stockQty) || 0,
    discountPercent: Number(product.discountPercent) || 0,
    options: parseProductOptions(product.options),
  });
};

const readProducts = () => {
  try {
    const saved = window.localStorage.getItem(storageKey);
    const products = saved ? JSON.parse(saved) : defaultProducts;
    return products.map(normalizeProduct);
  } catch {
    return defaultProducts.map(normalizeProduct);
  }
};

const readCategories = () => {
  try {
    const saved = window.localStorage.getItem(categoryStorageKey);
    const categories = saved ? JSON.parse(saved) : baseCategories;
    return categories.map(normalizeCategory).filter((category) => category.name);
  } catch {
    return baseCategories;
  }
};

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(readProducts);
  const [categories, setCategories] = useState(readCategories);

  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const apiCategories = await categoryApi.getAllAdmin();
        if (Array.isArray(apiCategories) && apiCategories.length > 0) {
          setCategories(apiCategories.map(normalizeCategory));
        }
      } catch (error) {
        console.error('Failed to load categories from API', error);
      }

      try {
        const apiProducts = await productApi.search({ page: 0, size: 100 });
        const productsList = Array.isArray(apiProducts)
          ? apiProducts
          : apiProducts?.content ?? [];

        if (Array.isArray(productsList) && productsList.length > 0) {
          setProducts(productsList.map(normalizeBackendProduct));
        }
      } catch (error) {
        console.error('Failed to load products from API', error);
      }
    };

    loadBackendData();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    window.localStorage.setItem(categoryStorageKey, JSON.stringify(categories));
  }, [categories]);

  const addCategory = useCallback(async (category) => {
    const nextCategory = normalizeCategory(category);

    if (!nextCategory.name) return false;

    try {
      const payload = new FormData();
      payload.append('name', nextCategory.name);
      payload.append('visible', String(nextCategory.visible));
      if (nextCategory.imageFile) {
        payload.append('image', nextCategory.imageFile);
      }

      const createdCategory = await categoryApi.create(payload);
      setCategories((current) => [...current, normalizeCategory(createdCategory)]);
      return true;
    } catch (error) {
      console.error('Failed to create category', error);
      throw error;
    }
  }, []);

  const updateCategory = useCallback(
    async (id, updates) => {
      setCategories((current) =>
        current.map((category) =>
          String(category.id) === String(id)
            ? normalizeCategory({
                ...category,
                ...updates,
                id: category.id,
              })
            : category
        )
      );

      try {
        const categoryToUpdate = categories.find((category) => String(category.id) === String(id));
        const nextCategory = normalizeCategory({
          ...categoryToUpdate,
          ...updates,
        });

        const payload = new FormData();
        payload.append('name', nextCategory.name);
        payload.append('visible', String(nextCategory.visible));
        if (nextCategory.imageFile) {
          payload.append('image', nextCategory.imageFile);
        }

        const updatedCategory = await categoryApi.update(id, payload);
        setCategories((current) =>
          current.map((category) =>
            String(category.id) === String(id) ? normalizeCategory(updatedCategory) : category
          )
        );
      } catch (error) {
        console.error('Failed to update category', error);
        throw error;
      }
    },
    [categories]
  );

  const removeCategory = useCallback(async (id) => {
    try {
      await categoryApi.delete(id);
      setCategories((current) =>
        current.filter((category) => String(category.id) !== String(id) && String(category.name) !== String(id))
      );
    } catch (error) {
      console.error('Failed to delete category', error);
      throw error;
    }
  }, []);

  const buildProductFormData = useCallback(
    (product) => {
      const category = categories.find((item) => item.name === product.category);
      const productPayload = {
        name: product.name,
        brand: product.brand,
        description: product.description || '',
        price: Number(product.price) || 0,
        stockQty: Number(product.stock) || 0,
        productStatus: null,
        isNew: Boolean(product.isNew),
        isPromotion: Boolean(product.isPromo),
        discountPercent: product.isPromo
          ? Number(product.discountPercent ?? product.discount) || 0
          : 0,
        rating: Number(product.rating) || 0,
        category: category ? { id: category.id } : null,
        options: serializeProductOptions(product.options),
      };

      const formData = new FormData();
      formData.append(
        'product',
        new Blob([JSON.stringify(productPayload)], { type: 'application/json' })
      );

      if (product.frontImageFile) {
        formData.append('frontImage', product.frontImageFile);
      }
      if (product.backImageFile) {
        formData.append('backImage', product.backImageFile);
      }
      if (product.galleryImageFiles && product.galleryImageFiles.length > 0) {
        product.galleryImageFiles.forEach((file) => {
          formData.append('galleryImages', file);
        });
      }

      return formData;
    },
    [categories]
  );

  const addProduct = useCallback(async (product) => {
    try {
      const payload = buildProductFormData(product);
      const createdProduct = await productApi.create(payload);
      setProducts((current) => [normalizeBackendProduct(createdProduct), ...current]);
      return true;
    } catch (error) {
      console.error('Failed to create product', error);
      throw error;
    }
  }, [buildProductFormData]);

  const updateProduct = useCallback(
    async (id, product) => {
      try {
        const payload = buildProductFormData(product);
        const updatedProduct = await productApi.update(id, payload);
        setProducts((current) =>
          current.map((item) =>
            String(item.id) === String(id) ? normalizeBackendProduct(updatedProduct) : item
          )
        );
        return true;
      } catch (error) {
        console.error('Failed to update product', error);
        throw error;
      }
    },
    [buildProductFormData]
  );

  const removeProduct = useCallback(async (id) => {
    try {
      await productApi.delete(id);
      setProducts((current) => current.filter((product) => String(product.id) !== String(id)));
    } catch (error) {
      console.error('Failed to delete product', error);
      throw error;
    }
  }, []);

  const togglePromotion = useCallback((id) => {
    setProducts((current) =>
      current.map((product) =>
        String(product.id) === String(id)
          ? {
              ...product,
              isPromo: !product.isPromo,
              discountPercent: product.isPromo
                ? 0
                : product.discountPercent || 10,
            }
          : product
      )
    );
  }, []);

  const stats = useMemo(() => {
    const categories = new Set(products.map((product) => product.category));

    return {
      totalProducts: products.length,
      promoProducts: products.filter((product) => product.isPromo).length,
      categories: categories.size,
      stockUnits: products.reduce(
        (total, product) => total + Number(product.stock ?? product.quantity ?? 0),
        0
      ),
      soldUnits: products.reduce(
        (total, product) => total + Number(product.sold || 0),
        0
      ),
      salesValue: products.reduce(
        (total, product) =>
          total + Number(product.sold || 0) * Number(product.price || 0),
        0
      ),
      lowStock: products.filter((product) => Number(product.quantity || 0) <= 3)
        .length,
      inventoryValue: products.reduce(
        (total, product) =>
          total +
          Number(product.price || 0) * Number(product.stock ?? product.quantity ?? 0),
        0
      ),
    };
  }, [products]);

  const availableProducts = useMemo(
    () => products.filter((product) => Number(product.quantity || product.stock || 0) > 0),
    [products]
  );

  const value = useMemo(
    () => ({
      addCategory,
      addProduct,
      categories,
      products,
      availableProducts,
      removeCategory,
      removeProduct,
      stats,
      togglePromotion,
      updateCategory,
      updateProduct,
      visibleCategories: categories.filter((category) => category.visible),
    }),
    [
      addCategory,
      addProduct,
      categories,
      products,
      removeCategory,
      removeProduct,
      stats,
      togglePromotion,
      updateCategory,
      updateProduct,
      availableProducts,
    ]
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}
