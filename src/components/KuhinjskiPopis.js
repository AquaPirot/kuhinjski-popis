// src/components/KuhinjskiPopis.js - Practical Version
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
  Edit3
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

  // Povratak na kategorije
  const goBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSearchTerm('');
  };

  // Category View - Kompaktna lista kategorija
  if (currentView === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Kuhinjski Popis</h1>
                  <p className="text-sm text-gray-500">Izaberite kategoriju namirnica</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Dodaj</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('history')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Istorija</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kompaktna lista kategorija */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Učitavanje kategorija...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map(category => {
                const IconComponent = CATEGORY_ICONS[category] || Package;
                const itemCount = itemsByCategory[category]?.length || 0;
                
                return (
                  <div
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentView('items');
                    }}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{category}</h3>
                          <p className="text-gray-500 text-sm">
                            {itemCount} {itemCount === 1 ? 'artikal' : itemCount < 5 ? 'artikla' : 'artikala'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">{itemCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Items Summary - Sticky na dnu */}
        {Object.keys(selectedItems).length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-lg p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ShoppingCart className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {Object.keys(selectedItems).length} odabranih artikala
                  </p>
                  <p className="text-sm text-gray-500">
                    Ukupno: {Object.values(selectedItems).reduce((sum, item) => sum + (item?.quantity || 0), 0).toFixed(2)}
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
                  onClick={saveList}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Sačuvaj popis</span>
                </button>
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

  // Items View - Prikaz artikala po kategoriji sa direktnim unosom količine
  if (currentView === 'items') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={goBackToCategories}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex items-center space-x-3">
                  {CATEGORY_ICONS[selectedCategory] && 
                    React.createElement(CATEGORY_ICONS[selectedCategory], { 
                      className: "w-8 h-8 text-blue-500" 
                    })
                  }
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{selectedCategory}</h1>
                    <p className="text-sm text-gray-500">{filteredItems.length} artikala</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Dodaj</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pretraži artikle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items List - Kompaktni prikaz sa direktnim unosom */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
          <div className="space-y-3">
            {filteredItems.map(item => {
              const isSelected = !!selectedItems[item.id];
              const quantity = selectedItems[item.id]?.quantity || '';
              
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow-md p-4 transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-lg">{item.name}</h3>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowEditModal(true);
                          }}
                          className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">Jedinica: {item.unit}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Količina:</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={quantity}
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
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

        {/* Selected Items Summary - Sticky na dnu */}
        {Object.keys(selectedItems).length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-lg p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ShoppingCart className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {Object.keys(selectedItems).length} odabranih artikala
                  </p>
                  <p className="text-sm text-gray-500">
                    Ukupno: {Object.values(selectedItems).reduce((sum, item) => sum + (item?.quantity || 0), 0).toFixed(2)}
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
                  onClick={saveList}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Sačuvaj</span>
                </button>
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