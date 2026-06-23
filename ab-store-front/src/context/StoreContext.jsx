import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProductPrice } from '../data/products';
import { useCatalog } from './catalog';
import { StoreContext } from './store';
import { orderApi } from '../services/api';

const readStorage = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeWishlist = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id));
};

const normalizeOrders = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter(Boolean)
    .map((order) => ({
      ...order,
      id: Number(order.id) || Date.now(),
      total: Number(order.total || order.totalPrice) || 0,
      status: normalizeOrderStatus(order.status),
      createdAt: order.createdAt || new Date().toISOString(),
      items: Array.isArray(order.items)
        ? order.items.map((item) => ({
            ...item,
            id: Number(item.id) || Date.now(),
            productId: Number(item.productId) || null,
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            name: item.name || item.productName || '',
          }))
        : [],
      firstName: order.firstName || '',
      lastName: order.lastName || '',
      phone: order.phone || '',
      email: order.email || '',
      wilaya: order.wilaya || '',
      baladiya: order.baladiya || '',
      address: order.address || order.fullAddress || '',
      fullAddress: order.fullAddress || order.address || '',
      postalCode: order.postalCode || '',
      notes: order.notes || order.additionalNotes || '',
      additionalNotes: order.additionalNotes || order.notes || '',
    }));
};

const normalizeOrderStatus = (status) => {
  const value = String(status || 'validated').toLowerCase();
  return value === 'canceled' ? 'cancelled' : value;
};

const toBackendOrderStatus = (status) => {
  const value = normalizeOrderStatus(status);
  return value === 'cancelled' ? 'CANCELED' : value.toUpperCase();
};

export function StoreProvider({ children }) {
  const { products } = useCatalog();
  const [wishlist, setWishlist] = useState(() =>
    normalizeWishlist(readStorage('ab-store-wishlist', []))
  );
  const [cart, setCart] = useState(() => readStorage('ab-store-cart', []));
  const [orders, setOrders] = useState(() =>
    normalizeOrders(readStorage('ab-store-orders', []))
  );

  useEffect(() => {
    window.localStorage.setItem('ab-store-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    window.localStorage.setItem('ab-store-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem('ab-store-orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const apiOrders = await orderApi.getAll();
        setOrders(normalizeOrders(apiOrders));
      } catch (error) {
        console.error('Failed to load orders from API', error);
      }
    };

    loadOrders();
  }, []);

  const toggleWishlist = useCallback((id) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id]
    );
  }, []);

  const addToCart = useCallback((id, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === id);

      if (!existing) {
        return [...current, { id, quantity }];
      }

      return current.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + quantity } : item
      );
    });
  }, []);

  const updateCartQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      setCart((current) => current.filter((item) => item.id !== id));
      return;
    }

    setCart((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const createOrder = useCallback(async (order) => {
    try {
      const apiOrder = await orderApi.create({
        ...order,
        fullAddress: order.address || order.fullAddress || '',
        additionalNotes: order.notes || order.additionalNotes || '',
      });
      setOrders((current) => [normalizeOrders([apiOrder])[0], ...current]);
      return apiOrder;
    } catch (error) {
      console.error('Failed to create order', error);
      throw error;
    }
  }, []);

  const updateOrderStatus = useCallback(async (id, status) => {
    try {
      const normalizedStatus = normalizeOrderStatus(status);
      setOrders((current) =>
        current.map((order) =>
          order.id === id ? { ...order, status: normalizedStatus } : order
        )
      );
      const updated = await orderApi.updateStatus(id, toBackendOrderStatus(status));
      setOrders((current) =>
        current.map((order) =>
          order.id === id ? normalizeOrders([updated])[0] : order
        )
      );
      return updated;
    } catch (error) {
      console.error('Failed to update order status', error);
      try {
        const apiOrders = await orderApi.getAll();
        setOrders(normalizeOrders(apiOrders));
      } catch (refreshError) {
        console.error('Failed to refresh orders after status update error', refreshError);
      }
      throw error;
    }
  }, []);

  const updateOrder = useCallback((id, updatedFields) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, ...updatedFields } : order
      )
    );
  }, []);

  const removeOrder = useCallback(async (id) => {
    try {
      await orderApi.delete(id);
      setOrders((current) => current.filter((order) => order.id !== id));
    } catch (error) {
      console.error('Failed to delete order', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => {
    const cartItems = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.id);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean);

    const normalizedWishlist = normalizeWishlist(wishlist);

    const wishlistItems = normalizedWishlist
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean);

    const wishlistCount = wishlistItems.length;
    const cartCount = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const cartTotal = cartItems.reduce(
      (total, item) => total + getProductPrice(item.product) * item.quantity,
      0
    );

    return {
      wishlist,
      wishlistItems,
      wishlistCount,
      cart,
      cartItems,
      cartCount,
      cartTotal,
      orders,
      createOrder,
      updateOrderStatus,
      updateOrder,
      removeOrder,
      addToCart,
      clearCart,
      removeFromCart,
      toggleWishlist,
      updateCartQuantity,
    };
  }, [
    addToCart,
    cart,
    clearCart,
    createOrder,
    orders,
    products,
    removeFromCart,
    toggleWishlist,
    updateOrderStatus,
    updateOrder,
    removeOrder,
    updateCartQuantity,
    wishlist,
  ]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}
