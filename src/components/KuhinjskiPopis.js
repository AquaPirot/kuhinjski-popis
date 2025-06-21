// src/components/KuhinjskiPopis.js - Complete Fixed Responsive Version
import React, { useState, useEffect } from 'react';
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
  Check,
  X,
  Calendar,
  User,
  Save,
  FileText,
  Edit3,
  Menu
} from 'lucide-react';
import AddItemModal from './AddItemModal';
import EditItemModal from './EditItemModal';
import HistoryView from './HistoryView';

const CATEGORY_ICONS = {
  'Meso i riba': Fish,
  'Mlečni proizvodi': Milk,
  'Voće i povrće': Apple,
  'Žitarice i brašno': Wheat,
  'Konzervirana hrana': Package,
  'Začini i dodaci': Soup,
  'Slatkiši': Cookie,
  'Napici': Coffee
};

export default function KuhinjskiPopis() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentView, setCurrentView] = useState('categories'); // categories, items, history
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [sastavio, setSastavio] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Kategorije koje postoje u bazi
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/namirnice/list');
      const result = await response.json();
      
      if (result.success) {
        setItems(result.data);
        // Izdvojimo unique kategorije
        const uniqueCategories = [...new Set(result.data.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filterovani artikli po kategoriji i search
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Grupisanje po kategorijama za category view
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const updateQuantity = (itemId, quantity) => {
    const numQuantity = parseFloat(quantity) || 0;
    
    if (numQuantity <= 0) {
      setSelectedItems(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    } else {
      const item = items.find(i => i.id === itemId);
      setSelectedItems(prev => ({
        ...prev,
        [itemId]: { ...item, quantity: numQuantity }
      }));
    }
  };

  const saveList = async () => {
    const selectedItemsList = Object.values(selectedItems).filter(Boolean);
    
    if (selectedItemsList.length === 0) {
      alert('Izaberite bar jedan artikal!');
      return;
    }

    if (!sastavio.trim()) {
      alert('Unesite ko je sastavio popis!');
      return;
    }

    // Potvrda pre čuvanja
    const confirmSave = confirm(`Da li želite da sačuvate popis sa ${selectedItemsList.length} artikala?\n\nSastavio: ${sastavio.trim()}`);
    if (!confirmSave) return;

    // Srpski datum i vreme
    const now = new Date();
    const serbianDateTime = now.toLocaleString('sr-RS', {
      timeZone: 'Europe/Belgrade',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    try {
      const response = await fetch('/api/popisi/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datum: serbianDateTime,
          sastavio: sastavio.trim(),
          items: selectedItemsList
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Popis uspešno sačuvan!');
        // Očisti state
        setSelectedItems({});
        setSastavio('');
        setCurrentView('categories');
        setSelectedCategory(null);
      } else {
        alert('Greška pri čuvanju: ' + result.error);
      }
    } catch (error) {
      alert('Greška pri čuvanju: ' + error.message);
    }
  };

  // Funkcija za brisanje trenutnog popisa
  const clearCurrentList = () => {
    const confirmClear = confirm('Da li ste sigurni da želite da obrišete trenutni popis?');
    if (confirmClear) {
      setSelectedItems({});
      setSastavio('');
    }
  };

  // Povratak na kategorije
  const goBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSearchTerm('');
    setShowMobileMenu(false);
  };

  // Responsive header component
  const Header = ({ title, subtitle, children }) => (
    <div className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {title}
          </div>
          
          {/* Desktop buttons */}
          <div className="hidden sm:flex space-x-2">
            {children}
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-gray-200 py-3 space-y-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );

  // Selected items count
  const selectedCount = Object.keys(selectedItems).length;
  const totalQuantity = Object.values(selectedItems).reduce((sum, item) => sum + (item?.quantity || 0), 0);

  // Category View - Responsive lista kategorija
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
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Kuhinjski Popis</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Izaberite kategoriju namirnica</p>
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

        {/* Categories Grid/List - Responsive */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-sm sm:text-base">Učitavanje kategorija...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {categories.map(category => {
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
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-lg truncate">{category}</h3>
                          <p className="text-gray-500 text-xs sm:text-sm">
                            {itemCount} {itemCount === 1 ? 'artikal' : itemCount < 5 ? 'artikla' : 'artikala'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-bold text-gray-600">{itemCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Items Summary - Responsive sticky bottom */}
        {selectedCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-lg p-3 sm:p-4 z-30">
            <div className="max-w-7xl mx-auto">
              {/* Mobile layout */}
              <div className="sm:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {selectedCount} odabranih
                      </p>
                      <p className="text-xs text-gray-500">
                        Ukupno: {totalQuantity.toFixed(2)}
                      </p>
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
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Sačuvaj
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
              
              {/* Desktop layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ShoppingCart className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedCount} odabranih artikala
                    </p>
                    <p className="text-sm text-gray-500">
                      Ukupno: {totalQuantity.toFixed(2)}
                    </p>
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
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Sačuvaj popis</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <AddItemModal 
          show={showAddModal} 
          onClose={() => setShowAddModal(false)}
          categories={categories}
          onUpdate={fetchItems}
        />
      </div>
    );
  }

  // Items View - Responsive prikaz artikala
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
                    className: "w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" 
                  })
                }
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{selectedCategory}</h1>
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

        {/* Search - Responsive */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pretraži artikle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Items List - Responsive */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-32">
          <div className="space-y-2 sm:space-y-3">
            {filteredItems.map(item => {
              const isSelected = !!selectedItems[item.id];
              const quantity = selectedItems[item.id]?.quantity || '';
              
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow-md p-3 sm:p-4 transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-lg'
                  }`}
                >
                  {/* Mobile layout */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-gray-500">Jedinica: {item.unit}</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowEditModal(true);
                        }}
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
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm"
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
                  
                  {/* Desktop layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-base lg:text-lg truncate">{item.name}</h3>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowEditModal(true);
                          }}
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
                          className="w-20 lg:w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
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
            })}
          </div>
        </div>

        {/* Selected Items Summary - Responsive sticky bottom */}
        {selectedCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-lg p-3 sm:p-4 z-30">
            <div className="max-w-7xl mx-auto">
              {/* Mobile layout */}
              <div className="sm:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {selectedCount} odabranih
                      </p>
                      <p className="text-xs text-gray-500">
                        Ukupno: {totalQuantity.toFixed(2)}
                      </p>
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
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Sačuvaj
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
              
              {/* Desktop layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ShoppingCart className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedCount} odabranih artikala
                    </p>
                    <p className="text-sm text-gray-500">
                      Ukupno: {totalQuantity.toFixed(2)}
                    </p>
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
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Sačuvaj</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <AddItemModal 
          show={showAddModal} 
          onClose={() => setShowAddModal(false)}
          categories={categories}
          onUpdate={fetchItems}
        />
        
        <EditItemModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          item={editingItem}
          categories={categories}
          onUpdate={fetchItems}
        />
      </div>
    );
  }

  // History View
  if (currentView === 'history') {
    return (
      <HistoryView 
        onBack={() => setCurrentView('categories')}
      />
    );
  }

  return null;
}