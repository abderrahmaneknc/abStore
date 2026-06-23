  import { Minus, Plus, ShoppingBag, Trash2, CheckCircle } from 'lucide-react';
  import { useState } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import { useLanguage } from '../context/language';
  import { useStore } from '../context/store';
  import { useToast } from '../context/toast';
  import { getProductPrice } from '../data/products';
  import { wilayas } from '../data/wilayas';

  export default function Cart() {
    const {
      cartItems,
      cartTotal,
      clearCart,
      removeFromCart,
      updateCartQuantity,
      createOrder,
    } = useStore();
    const { t } = useLanguage();
    const { confirm, toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      wilaya: '',
      baladiya: '',
      address: '',
      postalCode: '',
      notes: '',
    });

    const [errors, setErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleClearCart = async () => {
      const confirmed = await confirm({
        title: t('confirmClearTitle'),
        message: t('confirmClearMessage'),
        confirmLabel: t('clearCart'),
        cancelLabel: t('cancel'),
      });

      if (!confirmed) return;

      clearCart();
      toast({
        type: 'info',
        title: t('clearedCart'),
        message: t('confirmClearMessage'),
      });
    };

    const handleRemoveFromCart = async (product) => {
      const confirmed = await confirm({
        title: t('confirmRemoveTitle'),
        message: product.name,
        confirmLabel: t('remove'),
        cancelLabel: t('cancel'),
      });

      if (!confirmed) return;

      removeFromCart(product.id);
      toast({
        type: 'info',
        title: t('removedProduct'),
        message: product.name,
      });
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.firstName.trim()) newErrors.firstName = t('fieldRequired');
      if (!formData.lastName.trim()) newErrors.lastName = t('fieldRequired');
      if (!formData.phone.trim()) {
        newErrors.phone = t('fieldRequired');
      } else if (!/^(05|06|07)[0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = t('invalidPhone');
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('invalidEmail');
      }
      if (!formData.wilaya) newErrors.wilaya = t('fieldRequired');
      if (!formData.baladiya) newErrors.baladiya = t('fieldRequired');
      if (!formData.address.trim()) newErrors.address = t('fieldRequired');

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const confirmed = await confirm({
        title: t('confirmOrderTitle'),
        message: t('confirmOrderMessage'),
        confirmLabel: t('requestOrder'),
        cancelLabel: t('cancel'),
      });

      if (!confirmed) return;

      try {
        await createOrder({
          ...formData,
          total: cartTotal,
          status: 'pending',
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        });

        clearCart();
        setShowSuccessModal(true);
      } catch (error) {
        toast({
          type: 'danger',
          title: t('orderFailed'),
          message: error.message || t('orderFailedMessage'),
        });
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
      if (name === 'wilaya') {
        setFormData((prev) => ({ ...prev, baladiya: '' }));
      }
    };

    const selectedWilaya = wilayas.find(w => w.name === formData.wilaya);
    const baladiyas = selectedWilaya ? selectedWilaya.baladiyas : [];

    if (showSuccessModal) {
      return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-28 text-center md:pt-36">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 mb-8 animate-in zoom-in duration-300">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl text-gray-900 animate-in slide-in-from-bottom-4 duration-500">
            {t('orderSuccessTitle')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto leading-relaxed animate-in slide-in-from-bottom-6 duration-700">
            {t('orderSuccessMessage')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-8 inline-flex rounded-lg bg-gold px-8 py-3.5 font-semibold text-black transition hover:bg-yellow-600 animate-in slide-in-from-bottom-8 duration-700 delay-150"
          >
            {t('backToHome')}
          </button>
        </main>
      );
    }

    if (cartItems.length === 0) {
      return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-28 text-center md:pt-36">
          <ShoppingBag className="mx-auto h-14 w-14 text-gold" />
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            {t('cartEmpty')}
          </h1>
          <p className="mt-3 text-muted">{t('cartEmptyText')}</p>
          <Link
            to="/catalog"
            className="mt-8 inline-flex rounded-lg bg-gold px-6 py-3 font-semibold text-black"
          >
            {t('viewCatalog')}
          </Link>
        </main>
      );
    }

    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-28 md:pb-20 md:pt-36">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">
              {t('cart')}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              {t('checkoutTitle')}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleClearCart}
            className="self-start rounded-lg border border-border px-4 py-2 text-sm hover:text-gold sm:self-auto"
          >
            {t('clearCart')}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
          {/* Checkout Form */}
          <div className="space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-white p-6 shadow-sm">
              {/* Personal Info */}
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">{t('personalInfo')}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('firstName')} *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-gold ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('lastName')} *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-gold ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('phone')} *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="05/06/07..."
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-gold ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('emailOptional')}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-gold ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Shipping Address */}
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">{t('shippingAddress')}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('wilaya')} *</label>
                    <select
                      name="wilaya"
                      value={formData.wilaya}
                      onChange={handleChange}
                      className={`w-full rounded-lg border bg-white px-4 py-2.5 outline-none transition focus:border-gold ${errors.wilaya ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">{t('selectWilaya')}</option>
                      {wilayas.map(w => (
                        <option key={w.code} value={w.name}>{w.code} - {w.name}</option>
                      ))}
                    </select>
                    {errors.wilaya && <p className="mt-1 text-xs text-red-500">{errors.wilaya}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('baladiya')} *</label>
                    <select
                      name="baladiya"
                      value={formData.baladiya}
                      onChange={handleChange}
                      disabled={!formData.wilaya}
                      className={`w-full rounded-lg border bg-white px-4 py-2.5 outline-none transition focus:border-gold ${errors.baladiya ? 'border-red-500' : 'border-gray-300'} disabled:bg-gray-100 disabled:opacity-70`}
                    >
                      <option value="">{t('selectBaladiya')}</option>
                      {baladiyas.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {errors.baladiya && <p className="mt-1 text-xs text-red-500">{errors.baladiya}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('fullAddress')} *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-gold ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('postalCode')}</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Additional Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('additionalNotes')}</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gold"
                />
              </div>
            </form>
          </div>

          {/* Order Summary & Cart Items */}
          <aside className="space-y-6">
            <div className="rounded-xl border border-border bg-gray-900 p-5 text-white sm:p-6 lg:sticky lg:top-32">
              <h2 className="text-2xl font-bold">{t('summary')}</h2>
              
              {/* Cart Items List Mini */}
              <div className="mt-6 max-h-[300px] space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-4 border-b border-gray-800 pb-4">
                    <img src={product.image} alt={product.name} className="h-16 w-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-gold font-medium">{Math.round(getProductPrice(product)).toLocaleString()} DZD</span>
                        <div className="flex items-center rounded border border-gray-700 bg-gray-800">
                          <button type="button" onClick={() => quantity === 1 ? handleRemoveFromCart(product) : updateCartQuantity(product.id, quantity - 1)} className="px-2 py-1 text-gray-400 hover:text-white"><Minus size={12} /></button>
                          <span className="px-2 text-xs font-medium">{quantity}</span>
                          <button type="button" onClick={() => updateCartQuantity(product.id, quantity + 1)} className="px-2 py-1 text-gray-400 hover:text-white"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span>{cartTotal.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('delivery')}</span>
                  <span>{t('toConfirm')}</span>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-700 pt-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>{t('total')}</span>
                  <span>{cartTotal.toLocaleString()} DZD</span>
                </div>
                <button
                  form="checkout-form"
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center rounded-lg bg-gold px-6 py-3 font-semibold text-black transition hover:bg-yellow-600"
                >
                  {t('placeOrder')}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    );
  }
