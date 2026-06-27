import { Edit, PackageOpen, Plus, Search, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useLanguage } from '../../context/language';
import { useCatalog } from '../../context/catalog';
import { useToast } from '../../context/toast';
import DataTable from '../ui/DataTable';
import EmptyState from '../ui/EmptyState';
import ProductModal from './ProductModal';
import { getProductPrice } from '../../data/products';
import LoadingOverlay from '../ui/LoadingOverlay';

export default function ProductsManager() {
  const { t } = useLanguage();
  const { products, categories, addProduct, updateProduct, removeProduct } =
    useCatalog();
  const { confirm, toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const categoryNames = categories.map((category) => category.name);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
      
      let matchesStock = true;
      const stock = product.stock || 0;
      if (stockFilter === 'inStock') matchesStock = stock > 5;
      if (stockFilter === 'lowStock') matchesStock = stock > 0 && stock <= 5;
      if (stockFilter === 'outOfStock') matchesStock = stock === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSave = async (productData) => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      toast({ type: 'success', title: t('productSaved'), message: productData.name });
    } catch (error) {
      toast({ type: 'danger', title: t('productSaveError'), message: error.message || 'Unable to save product to the backend.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = await confirm({
      title: t('confirmDeleteProduct'),
      message: t('confirmDeleteProductText'),
      confirmLabel: t('remove'),
      cancelLabel: t('cancel')
    });

    if (confirmed) {
      setIsLoading(true);
      try {
        await removeProduct(product.id);
        toast({ type: 'info', title: t('productDeleted'), message: product.name });
      } catch (error) {
        toast({ type: 'danger', title: t('error'), message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = await confirm({
      title: t('confirmDeleteProduct'),
      message: `${t('bulkDeleteConfirm')} ${selectedIds.length} ${t('productsWord')}.`,
      confirmLabel: t('remove'),
      cancelLabel: t('cancel')
    });

    if (confirmed) {
      setIsLoading(true);
      try {
        await Promise.all(selectedIds.map(id => removeProduct(id)));
        setSelectedIds([]);
        toast({ type: 'info', title: t('productDeleted'), message: `${selectedIds.length} ${t('productsWord')}` });
      } catch (error) {
        toast({ type: 'danger', title: t('error'), message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBulkPromo = async () => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);
    try {
      await Promise.all(selectedIds.map(id => {
        const p = products.find(prod => String(prod.id) === String(id));
        if (p) {
          return updateProduct(id, { ...p, isPromo: true, discountPercent: p.discountPercent || 10 });
        }
        return Promise.resolve();
      }));
      setSelectedIds([]);
      toast({ type: 'success', title: t('promotionUpdated'), message: `${selectedIds.length} ${t('bulkPromoMessage')}` });
    } catch (error) {
      toast({ type: 'danger', title: t('error'), message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'select',
      label: (
        <input 
          type="checkbox" 
          checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
          onChange={toggleAll}
          className="rounded border-gray-300 text-gold focus:ring-gold"
        />
      ),
      sortable: false,
      render: (product) => (
        <input 
          type="checkbox" 
          checked={selectedIds.includes(product.id)}
          onChange={() => toggleSelection(product.id)}
          className="rounded border-gray-300 text-gold focus:ring-gold"
        />
      )
    },
    {
      key: 'product',
      label: t('products'),
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-3">
          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover border border-border" />
          <div>
            <div className="font-semibold text-gray-900 line-clamp-1">{product.name}</div>
            <div className="text-xs text-muted">{product.brand}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: t('category'),
      sortable: true,
      render: (product) => <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{product.category}</span>
    },
    {
      key: 'price',
      label: t('price'),
      sortable: true,
      render: (product) => (
        <div>
          <span className="font-semibold">{Math.round(getProductPrice(product)).toLocaleString()}</span>
          {product.isPromo && Number(product.discountPercent) > 0 && (
            <span className="text-xs text-green-600 font-bold ml-1">-{product.discountPercent}%</span>
          )}
        </div>
      )
    },
    {
      key: 'stock',
      label: t('stock'),
      sortable: true,
      render: (product) => {
        const stock = product.stock || 0;
        let color = 'text-green-600 bg-green-50 border-green-200';
        if (stock === 0) color = 'text-red-600 bg-red-50 border-red-200';
        else if (stock <= 5) color = 'text-orange-600 bg-orange-50 border-orange-200';
        
        return <span className={`text-xs font-medium px-2 py-1 rounded-full border ${color}`}>{stock === 0 ? t('outOfStock') : stock}</span>;
      }
    },
    {
      key: 'actions',
      label: t('actions'),
      render: (product) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(product)}
            className="p-1.5 text-gray-500 hover:text-gold hover:bg-yellow-50 rounded transition"
            aria-label={t('edit')}
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(product)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
            aria-label={t('remove')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <LoadingOverlay isLoading={isLoading} />
      <div className="flex flex-col gap-3 bg-white p-3 rounded-xl border border-border shadow-sm sm:p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('searchProduct')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-gold transition text-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 min-w-[120px] border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-gold transition bg-white text-sm"
          >
            <option value="">{t('allCategories')}</option>
            {categoryNames.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="flex-1 min-w-[120px] border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-gold transition bg-white text-sm"
          >
            <option value="">{t('productStatus')}</option>
            <option value="inStock">{t('inStock')}</option>
            <option value="lowStock">{t('lowStock')}</option>
            <option value="outOfStock">{t('outOfStock')}</option>
          </select>

          <button
            onClick={handleAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gold text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-600 transition shadow-sm whitespace-nowrap text-sm"
          >
            <Plus size={18} /> {t('addProduct')}
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-900">{selectedIds.length} {t('selectedProducts')}</span>
          <div className="flex gap-2">
            <button onClick={handleBulkPromo} className="text-sm font-medium text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 transition">
              {t('bulkPromo')}
            </button>
            <button onClick={handleBulkDelete} className="text-sm font-medium text-red-600 bg-white border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition">
              {t('bulkDelete')}
            </button>
          </div>
        </div>
      )}

      <DataTable 
        columns={columns}
        data={filteredProducts}
        keyField="id"
        itemsPerPage={12}
        emptyState={
          <EmptyState 
            icon={PackageOpen}
            title={t('noProducts')}
            description={t('noProductsText')}
          />
        }
      />

      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingProduct}
        />
      )}
    </div>
  );
}
