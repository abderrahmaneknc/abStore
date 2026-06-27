import {
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Home,
  ImagePlus,
  LogOut,
  MessageSquare,
  Package,
  Tags,
  Trash2,
  Mail,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../context/catalog';
import { useFeedback } from '../context/feedback';
import { useLanguage } from '../context/language';
import { useToast } from '../context/toast';
import OrdersManager from '../components/admin/OrdersManager';
import ProductsManager from '../components/admin/ProductsManager';
import StatsDashboard from '../components/admin/StatsDashboard';
import ContactsManager from '../components/admin/ContactsManager';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { authApi } from '../services/api';

const tabs = [
  { id: 'dashboard', translationKey: 'dashboard', icon: BarChart3 },
  { id: 'orders', translationKey: 'ordersTab', icon: Package },
  { id: 'products', translationKey: 'productsTab', icon: Boxes },
  { id: 'categories', translationKey: 'categoriesTab', icon: Tags },
  { id: 'feedback', translationKey: 'feedbackTab', icon: MessageSquare },
  { id: 'contacts', translationKey: 'contactsTab', icon: Mail },
];

export default function Admin() {
  const { addCategory, categories, removeCategory, updateCategory } =
    useCatalog();
  const {
    feedbacks,
    removeFeedback,
    toggleFeedbackVisibility,
    visibleFeedbacks,
  } = useFeedback();
  const { t } = useLanguage();
  const { confirm, toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState([]);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [isAuthed, setIsAuthed] = useState(
    () => window.localStorage.getItem('ab-store-admin-auth') === 'true'
  );
  const [newCategory, setNewCategory] = useState({
    name: '',
    image: '',
    imageFile: null,
    visible: true,
  });

  const averageRating =
    feedbacks.length === 0
      ? 0
      : feedbacks.reduce((total, item) => total + Number(item.rating || 0), 0) /
        feedbacks.length;

  const feedbackPageSize = 10;
  const feedbackTotalPages = Math.max(
    1,
    Math.ceil(feedbacks.length / feedbackPageSize)
  );
  const currentFeedbackPage = Math.min(feedbackPage, feedbackTotalPages);
  const paginatedFeedbacks = feedbacks.slice(
    (currentFeedbackPage - 1) * feedbackPageSize,
    currentFeedbackPage * feedbackPageSize
  );

  const toggleFeedbackSelection = (id) => {
    setSelectedFeedbackIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const toggleAllFeedback = () => {
    const allFeedbackIds = feedbacks.map((feedback) => feedback.id);
    const allFeedbackSelected = allFeedbackIds.every((id) =>
      selectedFeedbackIds.includes(id)
    );

    setSelectedFeedbackIds((current) =>
      allFeedbackSelected
        ? current.filter((id) => !allFeedbackIds.includes(id))
        : [...new Set([...current, ...allFeedbackIds])]
    );
  };

  const handleDeleteSelectedFeedback = async () => {
    if (selectedFeedbackIds.length === 0) return;

    const confirmed = await confirm({
      title: t('confirmDelete') || 'Delete selected?',
      message: `${t('bulkDeleteConfirm')} ${selectedFeedbackIds.length} ${t('feedbackTab')}.`,
      confirmLabel: t('remove'),
      cancelLabel: t('cancel'),
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await Promise.all(selectedFeedbackIds.map((id) => removeFeedback(id)));
      toast({
        type: 'info',
        title: t('feedbackDeleted') || 'Feedback deleted',
        message: `${selectedFeedbackIds.length} ${t('selected')}`,
      });
      setSelectedFeedbackIds([]);
    } catch (error) {
      toast({ type: 'danger', title: t('error'), message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    setIsLoading(true);
    try {
      const response = await authApi.login({ username, password });
      const token = response?.token;

      if (!token) {
        throw new Error(t('invalidCredentials') || 'Invalid credentials');
      }

      window.localStorage.setItem('ab-store-admin-auth', 'true');
      window.localStorage.setItem('token', token);
      setIsAuthed(true);
      toast({ type: 'success', title: t('signedIn'), message: username });
    } catch (error) {
      window.localStorage.removeItem('ab-store-admin-auth');
      window.localStorage.removeItem('token');
      toast({ type: 'danger', title: t('invalidCredentials'), message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem('ab-store-admin-auth');
    window.localStorage.removeItem('token');
    setIsAuthed(false);
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await addCategory(newCategory);
      toast({
        type: 'success',
        title: t('categoryAdded'),
        message: newCategory.name,
      });
      setNewCategory({ name: '', image: '', imageFile: null, visible: true });
    } catch (error) {
      toast({
        type: 'danger',
        title: t('categorySaveFailed'),
        message: error.message || t('categorySaveFailedText'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const readCategoryImage = (file, onLoad) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onLoad(reader.result, file);
    reader.readAsDataURL(file);
  };

  const handleRemoveCategory = async (category) => {
    const confirmed = await confirm({
      title: t('deleteCategoryTitle'),
      message: `${category.name} ${t('deleteCategoryMessage')}`,
      confirmLabel: t('remove'),
      cancelLabel: t('cancel'),
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await removeCategory(category.id);
      toast({
        type: 'info',
        title: t('categoryDeleted'),
        message: category.name,
      });
    } catch (error) {
      toast({
        type: 'danger',
        title: t('error'),
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-10 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
          <form
            onSubmit={handleLogin}
            className="w-full rounded-xl border border-white/10 bg-white p-6 text-gray-900 shadow-2xl"
          >
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                The Phone
              </p>
              <h1 className="mt-2 text-3xl font-bold">{t('adminLogin')}</h1>
              <p className="mt-2 text-sm text-muted">{t('adminLoginText')}</p>
            </div>
            <input
              name="username"
              placeholder={t('username')}
              className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-gold"
            />
            <input
              name="password"
              type="password"
              placeholder={t('password')}
              className="mt-3 w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="mt-5 w-full rounded-lg bg-gold px-5 py-3 font-semibold text-black transition hover:bg-yellow-600"
            >
              {t('login')}
            </button>
            <p className="mt-4 text-center text-xs text-muted">
              admin / admin
            </p>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <LoadingOverlay isLoading={isLoading} />
      <div className="flex flex-col lg:grid lg:grid-cols-[260px_1fr] min-h-screen">
        <aside className="bg-gray-950 p-4 text-white lg:p-6">
          <div className="flex items-center justify-between gap-3 lg:block">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                The Phone 
              </p>
              <h1 className="mt-1 text-2xl font-bold">{t('adminEssential')}</h1>
            </div>
            <button
              type="button"
              onClick={logout}
              className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white lg:hidden"
              aria-label={t('logout')}
            >
              <LogOut size={18} />
            </button>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:mt-6 lg:grid lg:gap-2 lg:overflow-visible lg:pb-0">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-semibold transition lg:px-4 lg:py-3 ${
                    activeTab === tab.id
                      ? 'bg-gold text-black'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <TabIcon size={18} />
                  <span className="hidden sm:inline">{t(tab.translationKey)}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 hidden gap-2 lg:grid">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15"
            >
              <Home size={18} />
              {t('backToStore')}
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/10"
            >
              <LogOut size={18} />
              {t('logout')}
            </button>
          </div>
        </aside>

        <section className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">
              {t('admin')}
            </p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              {t('adminTitle')}
            </h2>
            <p className="mt-2 text-muted">{t('adminSubtitle')}</p>
          </div>

          {activeTab === 'dashboard' && <StatsDashboard />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'contacts' && <ContactsManager />}

          {activeTab === 'categories' && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <form
                onSubmit={handleAddCategory}
                className="grid gap-4 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_1.2fr_auto_auto]"
              >
                <input
                  value={newCategory.name}
                  onChange={(event) =>
                    setNewCategory({
                      ...newCategory,
                      name: event.target.value,
                    })
                  }
                  placeholder={t('newCategory')}
                  className="rounded-lg border border-border px-4 py-3 outline-none focus:border-gold"
                />
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3 text-sm font-semibold text-muted transition hover:border-gold hover:text-gray-900">
                  <ImagePlus size={18} />
                  <span className="truncate">
                    {newCategory.image ? t('changeImage') : t('uploadImage') || 'Upload image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      readCategoryImage(event.target.files[0], (image, file) =>
                        setNewCategory({
                          ...newCategory,
                          image,
                          imageFile: file,
                        })
                      )
                    }
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNewCategory({
                      ...newCategory,
                      visible: !newCategory.visible,
                    })
                  }
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-gray-700 transition hover:text-gold"
                >
                  {newCategory.visible ? <Eye size={17} /> : <EyeOff size={17} />}
                  {newCategory.visible ? t('visible') : t('hidden')}
                </button>
                <button className="rounded-lg bg-gold px-5 py-3 font-semibold text-black">
                  {t('add')} {t('category').toLowerCase()}
                </button>
              </form>
              {newCategory.image && (
                <img
                  src={newCategory.image}
                  alt="New category preview"
                  className="mt-4 h-24 w-36 rounded-lg border border-border object-cover"
                />
              )}
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="grid h-14 w-14 place-items-center rounded-lg bg-gray-100 text-muted">
                          <ImagePlus size={20} />
                        </div>
                      )}
                      <input
                        value={category.name}
                        onChange={async (event) => {
                          setIsLoading(true);
                          try {
                            await updateCategory(category.id, {
                              name: event.target.value,
                            });
                          } catch (error) {
                            toast({ type: 'danger', title: t('error'), message: error.message });
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 font-semibold outline-none focus:border-gold focus:bg-white"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-gray-700 hover:text-gold">
                        <ImagePlus size={16} />
                        Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (event) => {
                            await readCategoryImage(
                              event.target.files[0],
                              async (image, file) => {
                                setIsLoading(true);
                                try {
                                  await updateCategory(category.id, {
                                    image,
                                    imageFile: file,
                                  });
                                } catch (error) {
                                  toast({ type: 'danger', title: t('error'), message: error.message });
                                } finally {
                                  setIsLoading(false);
                                }
                              }
                            );
                          }}
                          className="sr-only"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              await updateCategory(category.id, {
                                visible: !category.visible,
                              });
                            } catch (error) {
                              toast({ type: 'danger', title: t('error'), message: error.message });
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:text-gold"
                          aria-label={
                            category.visible
                              ? 'Hide from Our Products'
                              : 'Show in Our Products'
                          }
                        >
                          {category.visible ? (
                            <Eye size={17} />
                          ) : (
                            <EyeOff size={17} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(category)}
                          className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted hover:text-red-500"
                          aria-label={t('remove')}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-muted">{t('totalMessages') || 'Messages'}</p>
                  <p className="text-2xl font-bold">{feedbacks.length}</p>
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-muted">{t('visible')}</p>
                  <p className="text-2xl font-bold">
                    {visibleFeedbacks.length}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-muted">{t('averageRating') || 'Average rating'}</p>
                  <p className="text-2xl font-bold">
                    {averageRating.toFixed(1)}/5
                  </p>
                </div>
              </div>

              {feedbacks.length > 0 && (
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={
                        feedbacks.length > 0 &&
                        feedbacks.every((feedback) =>
                          selectedFeedbackIds.includes(feedback.id)
                        )
                      }
                      onChange={toggleAllFeedback}
                      className="rounded border-gray-300 text-gold focus:ring-gold"
                    />
                    {selectedFeedbackIds.length} {t('selected')}
                  </label>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedFeedback}
                    disabled={selectedFeedbackIds.length === 0}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    <Trash2 size={16} /> {t('deleteSelected') || t('bulkDelete')}
                  </button>
                </div>
              )}

              {paginatedFeedbacks.map((feedback) => (
                <article
                  key={feedback.id}
                  className="rounded-xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFeedbackIds.includes(feedback.id)}
                        onChange={() => toggleFeedbackSelection(feedback.id)}
                        className="mt-1 rounded border-gray-300 text-gold focus:ring-gold"
                        aria-label={`${t('selected')} ${feedback.name}`}
                      />
                      <div>
                      <div className="flex gap-1 text-gold text-lg">
                        {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                      </div>
                      <h3 className="mt-3 font-bold">{feedback.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {feedback.message}
                      </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await toggleFeedbackVisibility(feedback.id);
                          } catch (error) {
                            toast({ type: 'danger', title: t('error'), message: error.message });
                          }
                        }}
                        className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:text-gold"
                      >
                        {feedback.visible ? (
                          <Eye size={17} />
                        ) : (
                          <EyeOff size={17} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: t('confirmDelete') || 'Delete?',
                            message: 'Are you sure you want to delete this feedback?',
                            confirmLabel: t('remove'),
                            cancelLabel: t('cancel')
                          });
                          if (!confirmed) return;
                          try {
                            await removeFeedback(feedback.id);
                            setSelectedFeedbackIds((current) =>
                              current.filter((id) => id !== feedback.id)
                            );
                          } catch (error) {
                            toast({ type: 'danger', title: t('error'), message: error.message });
                          }
                        }}
                        className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted hover:text-red-500"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {feedbacks.length > feedbackPageSize && (
                <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
                  <span className="text-sm text-muted">
                    Page{' '}
                    <span className="font-semibold text-gray-900">
                      {currentFeedbackPage}
                    </span>{' '}
                    /{' '}
                    <span className="font-semibold text-gray-900">
                      {feedbackTotalPages}
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFeedbackPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentFeedbackPage === 1}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-border text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Previous feedback page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFeedbackPage((page) =>
                          Math.min(feedbackTotalPages, page + 1)
                        )
                      }
                      disabled={currentFeedbackPage === feedbackTotalPages}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-border text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Next feedback page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
