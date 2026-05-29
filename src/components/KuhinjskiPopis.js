import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Plus,
  History,
  Package,
  ChefHat,
  Coffee,
  Wheat,
  Fish,
  Milk,
  Apple,
  Soup,
  Cookie,
  ArrowLeft,
  Search,
  X,
  Save,
  Edit3,
  Menu,
  AlertCircle,
} from 'lucide-react';
import AddItemModal from './AddItemModal';
import EditItemModal from './EditItemModal';
import HistoryView from './HistoryView';
import { useToast, ToastContainer } from './Toast';
import {
  getAllItems,
  savePopis,
  getLastAuthor,
  saveLastAuthor,
} from '@/utils/storage';

const CATEGORY_ICONS = {
  'Meso i riba': Fish,
  'Mlečni proizvodi': Milk,
  'Voće i povrće': Apple,
  'Žitarice i brašno': Wheat,
  'Konzervirana hrana': Package,
  'Začini i dodaci': Soup,
  'Slatkiši': Cookie,
  'Napici': Coffee,
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/5" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function KuhinjskiPopis() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentView, setCurrentView] = useState('categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [sastavio, setSastavio] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const { toasts, showToast } = useToast();

  const fetchItems = useCallback(() => {
    try {
      setLoading(true);
      const data = getAllItems();
      setItems(data);
      setCategories([...new Set(data.map((item) => item.category))]);
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    setSastavio(getLastAuthor());
  }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const itemsByCategory = items.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const updateQuantity = useCallback(
    (itemId, quantity) => {
      const num = parseFloat(quantity) || 0;
      setSelectedItems((prev) => {
        const next = { ...prev };
        if (num <= 0) {
          delete next[itemId];
        } else {
          const found = items.find((i) => i.id === itemId);
          if (found) next[itemId] = { ...found, quantity: num };
        }
        return next;
      });
    },
    [items]
  );

  const saveList = () => {
    setSaveError('');
    const list = Object.values(selectedItems).filter(Boolean);

    if (list.length === 0) {
      setSaveError('Izaberite bar jedan artikal!');
      return;
    }
    if (!sastavio.trim()) {
      setSaveError('Unesite ko je sastavio popis!');
      return;
    }

    setSaving(true);
    try {
      savePopis(sastavio, list);
      saveLastAuthor(sastavio);
      showToast('Popis uspešno sačuvan!', 'success');
      setSelectedItems({});
      setCurrentView('categories');
      setSelectedCategory(null);
    } catch (err) {
      setSaveError(err.message || 'Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  };

  const clearCurrentList = () => {
    if (!confirm('Da li ste sigurni da želite da obrišete trenutni popis?')) return;
    setSelectedItems({});
    setSaveError('');
  };

  const goBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSearchTerm('');
    setShowMobileMenu(false);
  };

  const selectedCount = Object.keys(selectedItems).length;
  const totalQuantity = Object.values(selectedItems).reduce(
    (sum, item) => sum + (item?.quantity || 0),
    0
  );

  const StickyBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-lg p-3 sm:p-4 z-30 no-print">
      <div className="max-w-7xl mx-auto">
        {saveError && (
          <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Mobile */}
        <div className="sm:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{selectedCount} odabranih</p>
                <p className="text-xs text-gray-500">Ukupno: {totalQuantity.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={clearCurrentList}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={saveList}
                disabled={saving}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sačuvaj'
                )}
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Ko sastavlja popis?"
            value={sastavio}
            onChange={(e) => setSastavio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ShoppingCart className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-semibold text-gray-900">{selectedCount} odabranih artikala</p>
              <p className="text-sm text-gray-500">Ukupno: {totalQuantity.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Ko sastavlja?"
              value={sastavio}
              onChange={(e) => setSastavio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={clearCurrentList}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Obriši</span>
            </button>
            <button
              onClick={saveList}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Sačuvaj popis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const Header = ({ title, children }) => (
    <div className="bg-white shadow-lg sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">{title}</div>
          <div className="hidden sm:flex space-x-2">{children}</div>
          <div className="sm:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        {showMobileMenu && (
          <div className="sm:hidden border-t border-gray-200 py-3 space-y-2">{children}</div>
        )}
      </div>
    </div>
  );

  // ── History view ────────────────────────────────────────────────────────

  if (currentView === 'history') {
    return (
      <>
        <HistoryView onBack={() => setCurrentView('categories')} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  // ── Categories view ─────────────────────────────────────────────────────

  if (currentView === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header
          title={
            <>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Kuhinjski Popis
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  Izaberite kategoriju namirnica
                </p>
              </div>
            </>
          }
        >
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj</span>
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md text-sm"
          >
            <History className="w-4 h-4" />
            <span>Istorija</span>
          </button>
        </Header>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {categories.map((category) => {
                const IconComponent = CATEGORY_ICONS[category] || Package;
                const itemCount = itemsByCategory[category]?.length || 0;
                return (
                  <div
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentView('items');
                      setShowMobileMenu(false);
                    }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 p-4 animate-fade-up"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-11 h-11 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {category}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm">
                            {itemCount}{' '}
                            {itemCount === 1
                              ? 'artikal'
                              : itemCount < 5
                              ? 'artikla'
                              : 'artikala'}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-600">{itemCount}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedCount > 0 && <StickyBar />}

        <AddItemModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          categories={categories}
          onUpdate={fetchItems}
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // ── Items view ──────────────────────────────────────────────────────────

  if (currentView === 'items') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header
          title={
            <>
              <button
                onClick={goBackToCategories}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                {CATEGORY_ICONS[selectedCategory] &&
                  React.createElement(CATEGORY_ICONS[selectedCategory], {
                    className: 'w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0',
                  })}
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {selectedCategory}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">{filteredItems.length} artikala</p>
                </div>
              </div>
            </>
          }
        >
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj</span>
          </button>
        </Header>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 no-print">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pretraži artikle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-32">
          <div className="space-y-2 sm:space-y-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              filteredItems.map((item) => {
                const isSelected = !!selectedItems[item.id];
                const quantity = selectedItems[item.id]?.quantity || '';
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl shadow-sm p-3 sm:p-4 transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                    }`}
                  >
                    {/* Mobile */}
                    <div className="sm:hidden space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500">Jedinica: {item.unit}</p>
                        </div>
                        <button
                          onClick={() => { setEditingItem(item); setShowEditModal(true); }}
                          className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors flex-shrink-0"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-gray-600 flex-shrink-0">Količina:</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={quantity}
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm"
                        />
                        <span className="text-xs text-gray-500 flex-shrink-0">{item.unit}</span>
                        {isSelected && (
                          <button
                            onClick={() => updateQuantity(item.id, 0)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 text-base truncate">{item.name}</h3>
                          <button
                            onClick={() => { setEditingItem(item); setShowEditModal(true); }}
                            className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors flex-shrink-0"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">Jedinica: {item.unit}</p>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600 whitespace-nowrap">Količina:</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={quantity}
                            onChange={(e) => updateQuantity(item.id, e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                          />
                          <span className="text-sm text-gray-500">{item.unit}</span>
                        </div>
                        {isSelected && (
                          <button
                            onClick={() => updateQuantity(item.id, 0)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {selectedCount > 0 && <StickyBar />}

        <AddItemModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          categories={categories}
          onUpdate={fetchItems}
          showToast={showToast}
        />
        <EditItemModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          item={editingItem}
          categories={categories}
          onUpdate={fetchItems}
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  return null;
}
