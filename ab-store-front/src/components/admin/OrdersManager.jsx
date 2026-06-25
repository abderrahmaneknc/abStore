import { Eye, Search, Filter, Download, FileText, Table as TableIcon, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useLanguage } from '../../context/language';
import { useStore } from '../../context/store';
import { useToast } from '../../context/toast';
import { wilayas } from '../../data/wilayas';
import DataTable from '../ui/DataTable';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';
import LoadingOverlay from '../ui/LoadingOverlay';
import { formatSelectedOptions } from '../../utils/productOptions';

export default function OrdersManager() {
  const { orders, updateOrderStatus, removeOrder } = useStore();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [wilayaFilter, setWilayaFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const statuses = ['pending', 'validated', 'shipped', 'delivered', 'cancelled'];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toString().includes(searchTerm) ||
        `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      const matchesWilaya = wilayaFilter ? order.wilaya === wilayaFilter : true;

      return matchesSearch && matchesStatus && matchesWilaya;
    });
  }, [orders, searchTerm, statusFilter, wilayaFilter]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'validated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`${t('confirmDelete')} ${selectedIds.length} commandes ?`)) {
      setIsLoading(true);
      try {
        await Promise.all(selectedIds.map(id => removeOrder(id)));
        setSelectedIds([]);
      } catch (error) {
        toast({ type: 'danger', title: t('error'), message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getExportData = () => {
    return filteredOrders.map(o => ({
      ID: o.id,
      Prenom: o.firstName,
      Nom: o.lastName,
      Telephone: o.phone,
      Email: o.email || '',
      Wilaya: o.wilaya,
      Baladiya: o.baladiya,
      Adresse: o.fullAddress || o.address || '',
      CodePostal: o.postalCode || '',
      Articles: (o.items || []).map(i => {
        const options = formatSelectedOptions(i.selectedOptions, t);
        const label = `${i.name || i.productName || ''} x${i.quantity}${options ? ` (${options})` : ''} (${i.price} DZD)`;
        return label;
      }).join(' | '),
      Total: o.total,
      Notes: o.notes || o.additionalNotes || '',
      Date: new Date(o.createdAt).toLocaleDateString(),
      Statut: t(o.status) || o.status
    }));
  };

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Commandes');
    XLSX.writeFile(wb, 'commandes.csv');
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Commandes');
    XLSX.writeFile(wb, 'commandes.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('Liste des Commandes', 14, 15);
    doc.setFontSize(10);
    doc.text(`Genere le: ${new Date().toLocaleDateString()}`, 14, 22);

    const head = [['ID', 'Client', 'Tel', 'Email', 'Wilaya', 'Baladiya', 'Adresse', 'Articles', 'Total (DZD)', 'Notes', 'Date', 'Statut']];
    const body = filteredOrders.map(o => [
      String(o.id),
      `${o.firstName} ${o.lastName}`,
      o.phone,
      o.email || '-',
      o.wilaya,
      o.baladiya || '-',
      o.fullAddress || o.address || '-',
      (o.items || []).map(i => `${i.name || i.productName || '?'} x${i.quantity}`).join(', '),
      String(o.total),
      o.notes || o.additionalNotes || '-',
      new Date(o.createdAt).toLocaleDateString(),
      t(o.status) || o.status
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 28,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [212, 137, 0], textColor: 0, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        7: { cellWidth: 50 },
        9: { cellWidth: 30 },
      },
    });
    doc.save('commandes.pdf');
  };

  const columns = [
    {
      key: 'select',
      label: (
        <input 
          type="checkbox" 
          checked={selectedIds.length > 0 && selectedIds.length === filteredOrders.length}
          onChange={toggleAll}
          className="rounded border-gray-300 text-gold focus:ring-gold"
        />
      ),
      sortable: false,
      render: (order) => (
        <input 
          type="checkbox" 
          checked={selectedIds.includes(order.id)}
          onChange={() => toggleSelection(order.id)}
          className="rounded border-gray-300 text-gold focus:ring-gold"
        />
      )
    },
    {
      key: 'id',
      label: t('orderId'),
      sortable: true,
      render: (order) => <span className="font-mono font-medium">#{order.id.toString().slice(-6)}</span>
    },
    {
      key: 'customer',
      label: t('customer'),
      sortable: true,
      render: (order) => (
        <div>
          <div className="font-semibold text-gray-900">{order.firstName} {order.lastName}</div>
          <div className="text-xs text-muted">{order.phone}</div>
        </div>
      )
    },
    {
      key: 'wilaya',
      label: t('wilaya'),
      sortable: true,
      render: (order) => (
        <div>
          <div className="text-sm">{order.wilaya}</div>
          <div className="text-xs text-muted">{order.baladiya}</div>
        </div>
      )
    },
    {
      key: 'total',
      label: t('total'),
      sortable: true,
      render: (order) => <span className="font-semibold">{order.total.toLocaleString()} DZD</span>
    },
    {
      key: 'createdAt',
      label: t('orderDate'),
      sortable: true,
      render: (order) => <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
    },
    {
      key: 'status',
      label: t('status'),
      sortable: true,
      render: (order) => (
        <select
          value={order.status}
          onChange={async (e) => {
            setIsLoading(true);
            try {
              await updateOrderStatus(order.id, e.target.value);
            } catch (error) {
              toast({ type: 'danger', title: t('error'), message: error.message });
            } finally {
              setIsLoading(false);
            }
          }}
          className={`px-2 py-1 rounded-full text-xs font-medium border outline-none cursor-pointer ${getStatusColor(order.status)}`}
        >
          {statuses.map(s => (
            <option key={s} value={s} className="bg-white text-gray-900">{t(s) || s}</option>
          ))}
        </select>
      )
    },
    {
      key: 'actions',
      label: t('actions'),
      render: (order) => (
        <button
          onClick={() => handleViewOrder(order)}
          className="flex items-center gap-1 text-sm font-medium text-gold hover:text-yellow-600"
        >
          <Eye size={16} /> {t('viewDetails')}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <LoadingOverlay isLoading={isLoading} />
      {/* Filters Bar */}
      <div className="flex flex-col gap-3 bg-white p-3 rounded-xl border border-border shadow-sm sm:p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('searchOrders')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-gold transition text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 min-w-[120px] border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-gold transition bg-white text-sm"
          >
            <option value="">{t('allStatuses')}</option>
            {statuses.map(s => (
              <option key={s} value={s}>{t(s)}</option>
            ))}
          </select>

          <select
            value={wilayaFilter}
            onChange={(e) => setWilayaFilter(e.target.value)}
            className="flex-1 min-w-[120px] border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-gold transition bg-white text-sm"
          >
            <option value="">{t('wilaya')}</option>
            {wilayas.map(w => (
              <option key={w.code} value={w.name}>{w.name}</option>
            ))}
          </select>

          <div className="flex gap-1">
            <button onClick={handleExportCSV} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="CSV">
              <TableIcon size={16} />
            </button>
            <button onClick={handleExportExcel} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-green-600 transition" title="Excel">
              <FileText size={16} />
            </button>
            <button onClick={handleExportPDF} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600 transition" title="PDF">
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-red-900">{selectedIds.length} {t('selected')}</span>
          <button onClick={handleBulkDelete} className="flex items-center gap-1 text-sm font-medium text-white bg-red-600 px-3 py-1.5 rounded hover:bg-red-700 transition">
            <Trash2 size={16} /> {t('bulkDelete')}
          </button>
        </div>
      )}

      {/* Orders Table */}
      <DataTable 
        columns={columns}
        data={filteredOrders}
        keyField="id"
        itemsPerPage={10}
        emptyState={
          <EmptyState 
            icon={Filter}
            title={t('noOrders')}
            description={t('noOrdersText')}
          />
        }
      />

      {/* Order Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${t('orderId')} #${selectedOrder?.id?.toString().slice(-6)}`}
        maxWidth="max-w-3xl"
      >
        {selectedOrder && (
          <div className="space-y-8">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-border">
              <div>
                <p className="text-sm text-muted">{t('orderDate')}</p>
                <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">{t('status')}</p>
                <select
                  value={selectedOrder.status}
                  onChange={async (e) => {
                    setIsLoading(true);
                    try {
                      await updateOrderStatus(selectedOrder.id, e.target.value);
                      setSelectedOrder({...selectedOrder, status: e.target.value});
                    } catch (error) {
                      toast({ type: 'danger', title: t('error'), message: error.message });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className={`mt-1 text-sm font-medium rounded-full px-3 py-1 outline-none border cursor-pointer ${getStatusColor(selectedOrder.status)}`}
                >
                  {statuses.map(s => (
                    <option key={s} value={s} className="bg-white text-gray-900">{t(s)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">{t('customer')}</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted w-24 inline-block">{t('name')}:</span> <span className="font-medium">{selectedOrder.firstName} {selectedOrder.lastName}</span></p>
                  <p><span className="text-muted w-24 inline-block">{t('phone')}:</span> <span className="font-medium">{selectedOrder.phone}</span></p>
                  {selectedOrder.email && <p><span className="text-muted w-24 inline-block">Email:</span> <span className="font-medium">{selectedOrder.email}</span></p>}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">{t('shippingAddress')}</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted w-24 inline-block">{t('wilaya')}:</span> <span className="font-medium">{selectedOrder.wilaya}</span></p>
                  <p><span className="text-muted w-24 inline-block">{t('baladiya')}:</span> <span className="font-medium">{selectedOrder.baladiya}</span></p>
                  <p><span className="text-muted w-24 inline-block">{t('address')}:</span> <span className="font-medium">{selectedOrder.fullAddress}</span></p>
                  {selectedOrder.postalCode && <p><span className="text-muted w-24 inline-block">Code Postal:</span> <span className="font-medium">{selectedOrder.postalCode}</span></p>}
                </div>
              </div>
            </div>

            {selectedOrder.notes && (
              <div>
                <h4 className="font-bold text-gray-900 mb-2">{t('additionalNotes')}</h4>
                <p className="text-sm bg-yellow-50 text-yellow-900 p-3 rounded-lg border border-yellow-200">
                  {selectedOrder.notes}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">{t('orderDetails')}</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div className="flex gap-3 items-center">
                      <div className="bg-gray-100 text-gray-600 font-medium px-2 py-1 rounded text-xs">
                        x{item.quantity}
                      </div>
                      <div>
                        <span className="font-medium">{item.name || item.productName}</span>
                        {formatSelectedOptions(item.selectedOptions, t) && (
                          <p className="text-xs text-muted">
                            {formatSelectedOptions(item.selectedOptions, t)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold">{item.price.toLocaleString()} DZD</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="font-bold text-lg">{t('total')}</span>
                <span className="font-bold text-xl text-gold">{selectedOrder.total.toLocaleString()} DZD</span>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-between">
              <button
                onClick={async () => {
                  if (window.confirm("Voulez-vous vraiment supprimer cette commande ?")) {
                    setIsLoading(true);
                    try {
                      await removeOrder(selectedOrder.id);
                      setIsModalOpen(false);
                    } catch (error) {
                      toast({ type: 'danger', title: t('error'), message: error.message });
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                className="text-red-600 font-medium hover:text-red-700 hover:underline px-3 py-2 text-sm"
              >
                {t('remove')}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
