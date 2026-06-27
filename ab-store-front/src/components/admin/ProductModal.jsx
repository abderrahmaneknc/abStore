import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useCatalog } from '../../context/catalog';
import { useLanguage } from '../../context/language';
import { useToast } from '../../context/toast';
import {
  extractColorAndStorage,
  extractCustomOptionGroups,
  buildProductOptions,
  PRESET_COLORS,
  PRESET_STORAGE,
} from '../../utils/productOptions';
import OptionChipSelector from './OptionChipSelector';
import Modal from '../ui/Modal';

const createCustomGroup = () => ({
  id: crypto.randomUUID(),
  name: '',
  values: [],
});

const createEmptyProduct = (category) => ({
  name: '',
  brand: '',
  category,
  price: '',
  rating: 5,
  image: '',
  image2: '',
  description: '',
  isNew: false,
  isPromo: false,
  discountPercent: 0,
  stock: 10,
  colors: [],
  storage: [],
  customOptionGroups: [],
  frontImageFile: null,
  backImageFile: null,
  galleryImageFiles: [],
  galleryImagesPreview: [],
});

const normalizeInitialProduct = (product) => {
  const { colors, storage } = extractColorAndStorage(product.options);

  return {
    ...product,
    frontImageFile: null,
    backImageFile: null,
    image: product.image || product.imageUrl || '',
    image2: product.image2 || '',
    discountPercent: Number(product.discountPercent ?? product.discount) || 0,
    colors,
    storage,
    customOptionGroups: extractCustomOptionGroups(product.options),
    galleryImageFiles: [],
    galleryImagesPreview: product.galleryImages || [],
  };
};

export default function ProductModal({ isOpen, onClose, onSave, initialData }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { categories } = useCatalog();

  const categoryNames = categories.map((category) => category.name);
  const defaultCategory = categoryNames[0] || '';
  const [formData, setFormData] = useState(
    () =>
      initialData
        ? normalizeInitialProduct(initialData)
        : createEmptyProduct(defaultCategory)
  );

  const handleImageUpload = (e, field, previewField) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          [previewField]: reader.result,
          [field]: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.galleryImageFiles.length > 7) {
      toast({ type: 'danger', title: t('maxImagesReached') });
      return;
    }

    const newFiles = [...formData.galleryImageFiles];
    const newPreviews = [...formData.galleryImagesPreview];

    files.forEach(file => {
      newFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setFormData(prev => ({
          ...prev,
          galleryImageFiles: newFiles,
          galleryImagesPreview: newPreviews,
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index) => {
    const newFiles = [...formData.galleryImageFiles];
    const newPreviews = [...formData.galleryImagesPreview];

    if (index < newFiles.length) {
      newFiles.splice(index, 1);
    }

    newPreviews.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      galleryImageFiles: newFiles,
      galleryImagesPreview: newPreviews,
    }));
  };

  const updateColorStorage = (field, values) => {
    setFormData((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  const addCustomOptionGroup = () => {
    setFormData((prev) => ({
      ...prev,
      customOptionGroups: [...(prev.customOptionGroups || []), createCustomGroup()],
    }));
  };

  const updateCustomOptionGroup = (index, updates) => {
    setFormData((prev) => ({
      ...prev,
      customOptionGroups: prev.customOptionGroups.map((group, groupIndex) =>
        groupIndex === index ? { ...group, ...updates } : group
      ),
    }));
  };

  const removeCustomOptionGroup = (index) => {
    setFormData((prev) => ({
      ...prev,
      customOptionGroups: prev.customOptionGroups.filter((_, groupIndex) => groupIndex !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: Number(formData.price),
      rating: Number(formData.rating),
      discountPercent: formData.isPromo ? Number(formData.discountPercent) || 0 : 0,
      stock: Number(formData.stock),
      options: buildProductOptions(
        formData.colors,
        formData.storage,
        formData.customOptionGroups
      ),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('updateProduct') : t('addProduct')}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('name')} *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('brand')} *</label>
            <input
              required
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('category')} *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gold"
            >
              {categoryNames.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('price')} (DZD) *</label>
            <input
              required
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gold"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('description')} *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('image')} *</label>
            <input
              required={!formData.image}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'frontImageFile', 'image')}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 outline-none focus:border-gold file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {formData.image && (
              <img src={formData.image} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded shadow-sm border border-border" />
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('secondImage')}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'backImageFile', 'image2')}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 outline-none focus:border-gold file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {formData.image2 && (
              <img src={formData.image2} alt="Preview 2" className="mt-2 h-16 w-16 object-cover rounded shadow-sm border border-border" />
            )}
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('productGallery')} (Max 7)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              disabled={formData.galleryImagesPreview.length >= 7}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 outline-none focus:border-gold file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {formData.galleryImagesPreview.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.galleryImagesPreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`Gallery ${index}`} className="h-16 w-16 object-cover rounded shadow-sm border border-border" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('stock')}</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('rating')} (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gold"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-3 block text-sm font-medium text-gray-700">{t('productOptions')}</label>
            <div className="space-y-5 rounded-lg border border-border p-4">
              <OptionChipSelector
                label={t('color')}
                quickChooseLabel={t('quickChoose')}
                customPlaceholder={t('colorPlaceholder')}
                addLabel={t('addCustomValue')}
                hint={t('colorOptionsHint')}
                presets={[...new Set([...PRESET_COLORS, ...(formData.colors || [])])]}
                selected={formData.colors || []}
                onChange={(values) => updateColorStorage('colors', values)}
              />
              <OptionChipSelector
                label={t('storage')}
                quickChooseLabel={t('quickChoose')}
                customPlaceholder={t('storagePlaceholder')}
                addLabel={t('addCustomValue')}
                hint={t('storageOptionsHint')}
                presets={[...new Set([...PRESET_STORAGE, ...(formData.storage || [])])]}
                selected={formData.storage || []}
                onChange={(values) => updateColorStorage('storage', values)}
              />

              {(formData.customOptionGroups || []).map((group, index) => (
                <div key={group.id} className="space-y-3 rounded-lg border border-dashed border-gray-300 p-4">
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateCustomOptionGroup(index, { name: e.target.value })}
                      placeholder={t('optionNamePlaceholder')}
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomOptionGroup(index)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      {t('removeOptionGroup')}
                    </button>
                  </div>
                  <OptionChipSelector
                    label={group.name || t('customOptionValues')}
                    quickChooseLabel={t('quickChoose')}
                    customPlaceholder={t('optionValuesPlaceholder')}
                    addLabel={t('addCustomValue')}
                    presets={[...new Set(group.values || [])]}
                    selected={group.values || []}
                    onChange={(values) => updateCustomOptionGroup(index, { values })}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addCustomOptionGroup}
                className="inline-flex items-center rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gold hover:text-gold"
              >
                + {t('addOptionGroup')}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-6 md:col-span-2 pt-2 border-t border-border mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">{t('isNew')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPromo}
                onChange={(e) => setFormData({ ...formData, isPromo: e.target.checked })}
                className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">{t('isPromo')}</span>
            </label>
            {formData.isPromo && (
              <div className="flex-1 max-w-[200px]">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder={t('discount')}
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1 outline-none focus:border-gold"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gold text-black hover:bg-yellow-600 transition shadow-sm"
          >
            {t('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
