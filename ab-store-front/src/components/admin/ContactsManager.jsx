import { useEffect, useState } from 'react';
import { MailOpen, Mail, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/language';
import { useToast } from '../../context/toast';
import { contactApi } from '../../services/api';
import DataTable from '../ui/DataTable';
import EmptyState from '../ui/EmptyState';
import LoadingOverlay from '../ui/LoadingOverlay';

export default function ContactsManager() {
  const { t } = useLanguage();
  const { confirm, toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactApi.getAll();
      setContacts(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (contact) => {
    if (contact.isRead) return;
    try {
      setIsLoading(true);
      await contactApi.markAsRead(contact.id);
      setContacts(contacts.map(c => c.id === contact.id ? { ...c, isRead: true } : c));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (contact) => {
    const confirmed = await confirm({
      title: t('deleteCategoryTitle'),
      message: `${contact.name} sera supprimé des messages de contact.`,
      confirmLabel: t('remove'),
      cancelLabel: t('cancel')
    });

    if (confirmed) {
      try {
        setIsLoading(true);
        await contactApi.delete(contact.id);
        setContacts(contacts.filter(c => c.id !== contact.id));
        setSelectedIds((current) => current.filter((id) => id !== contact.id));
        toast({ type: 'info', title: t('contactDeleted'), message: contact.name });
      } catch (error) {
        console.error('Failed to delete contact:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.length === contacts.length
        ? []
        : contacts.map((contact) => contact.id)
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = await confirm({
      title: t('confirmDelete') || 'Delete selected?',
      message: `${t('bulkDeleteConfirm')} ${selectedIds.length} ${t('contactsTab')}.`,
      confirmLabel: t('remove'),
      cancelLabel: t('cancel')
    });
    if (confirmed) {
      try {
        setIsLoading(true);
        await Promise.all(selectedIds.map((id) => contactApi.delete(id)));
        setContacts((current) =>
          current.filter((contact) => !selectedIds.includes(contact.id))
        );
        toast({
          type: 'info',
          title: t('contactDeleted') || 'Deleted',
          message: `${selectedIds.length} ${t('selected')}`,
        });
        setSelectedIds([]);
      } catch (error) {
        console.error('Failed to delete selected contacts:', error);
        toast({ type: 'danger', title: t('error'), message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const unreadCount = contacts.filter(c => !c.isRead).length;
  const readCount = contacts.length - unreadCount;

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length > 0 && selectedIds.length === contacts.length}
          onChange={toggleAll}
          className="rounded border-gray-300 text-gold focus:ring-gold"
        />
      ),
      sortable: false,
      render: (contact) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(contact.id)}
          onChange={() => toggleSelection(contact.id)}
          className="rounded border-gray-300 text-gold focus:ring-gold"
          aria-label={`${t('selected')} ${contact.name}`}
        />
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (contact) => (
        <div className="flex items-center justify-center">
          {contact.isRead ? (
            <MailOpen size={20} className="text-gray-400" />
          ) : (
            <div className="relative">
              <Mail size={20} className="text-gold" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: t('name'),
      sortable: true,
      render: (contact) => (
        <div>
          <div className={`font-semibold ${contact.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
            {contact.name}
          </div>
          <div className="text-xs text-muted">{contact.phoneOrEmail}</div>
        </div>
      )
    },
    {
      key: 'message',
      label: 'Message',
      sortable: false,
      render: (contact) => (
        <div className={`text-sm line-clamp-2 max-w-md ${contact.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
          {contact.message}
        </div>
      )
    },
    {
      key: 'date',
      label: t('date'),
      sortable: true,
      render: (contact) => {
        const date = new Date(contact.createdAt);
        return (
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: t('actions'),
      render: (contact) => (
        <div className="flex items-center gap-2">
          {!contact.isRead && (
            <button
              onClick={() => handleMarkAsRead(contact)}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-gray-100 text-gray-700 hover:bg-gold hover:text-black transition"
            >
              {t('markAsRead')}
            </button>
          )}
          <button
            onClick={() => handleDelete(contact)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition ml-auto"
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
      
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-border">
          <p className="text-sm text-muted">{t('totalMessages')}</p>
          <p className="text-2xl font-bold">{contacts.length}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-border">
          <p className="text-sm text-muted">{t('unreadMessages')}</p>
          <p className="text-2xl font-bold text-gold">{unreadCount}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-border">
          <p className="text-sm text-muted">{t('readMessages')}</p>
          <p className="text-2xl font-bold text-gray-400">{readCount}</p>
        </div>
      </div>

      {contacts.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {selectedIds.length} {t('selected')}
          </span>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Trash2 size={16} /> {t('deleteSelected') || t('bulkDelete')}
          </button>
        </div>
      )}

      <DataTable 
        columns={columns}
        data={contacts}
        keyField="id"
        itemsPerPage={10}
        emptyState={
          <EmptyState 
            icon={Mail}
            title={t('noContacts')}
            description={t('noContactsText')}
          />
        }
      />
    </div>
  );
}
