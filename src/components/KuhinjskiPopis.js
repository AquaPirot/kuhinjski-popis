import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import AddItemModal from './AddItemModal';
import EditItemModal from './EditItemModal';
import { generatePDF } from '../utils/pdfGenerator';
import { Plus, Edit3, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function KuhinjskiPopis() {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]);
  const [sastavio, setSastavio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [deleteMode, setDeleteMode] = useState(false);

  // kontrola za expand/collapse
  const [expandedCategories, setExpandedCategories] = useState({});

  const fetchItems = async () => {
    const snapshot = await getDocs(collection(db, 'namirnice'));
    const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ukloni duplikate na osnovu naziva
    const uniqueItems = itemList.reduce((acc, current) => {
      const exists = acc.find(item => 
        item.name.toLowerCase().trim() === current.name.toLowerCase().trim()
      );
      if (!exists) {
        acc.push(current);
      } else {
        console.warn(`Duplikat pronađen: ${current.name} (ID: ${current.id})`);
      }
      return acc;
    }, []);
    
    setItems(uniqueItems);

    // inicijalno otvori sve kategorije
    const initialExpanded = {};
    categoryOrder.forEach(cat => {
      initialExpanded[cat] = true;
    });
    setExpandedCategories(initialExpanded);

    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleQuantityChange = (id, value) => {
    // omogući unos i sa vodećom nulom (0.55) ili bez
    const cleanValue = value.replace(',', '.');
    setQuantities(prev => ({ ...prev, [id]: cleanValue }));
  };

  const handleSave = async () => {
    if (!sastavio.trim()) {
      alert('Unesite ime osobe koja sastavlja popis.');
      return;
    }

    const itemsWithQuantities = items.filter(item => parseFloat(quantities[item.id]) > 0);
    if (itemsWithQuantities.length === 0) {
      alert('Dodajte barem jedan artikal s količinom.');
      return;
    }

    const popis = {
      datum,
      sastavio,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity: parseFloat(quantities[item.id]) || 0
      })),
      timestamp: new Date().toISOString()
    };

    setSaving(true);
    try {
      await addDoc(collection(db, 'popisi'), popis);
      alert('Popis uspešno sačuvan u bazu!');
      setQuantities({});
      setSastavio('');
      setDatum(new Date().toISOString().split('T')[0]);
    } catch (error) {
      alert('Greška: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedItems(new Set());
  };

  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      alert('Nema odabranih artikala za brisanje.');
      return;
    }

    const confirmed = window.confirm(
      `Da li ste sigurni da želite da obrišete ${selectedItems.size} artikal(a)? Ova akcija se ne može poništiti.`
    );

    if (!confirmed) return;

    setSaving(true);
    try {
      const deletePromises = Array.from(selectedItems).map(itemId => 
        deleteDoc(doc(db, 'namirnice', itemId))
      );
      
      await Promise.all(deletePromises);
      
      alert(`Uspešno obrisano ${selectedItems.size} artikal(a)!`);
      setSelectedItems(new Set());
      setDeleteMode(false);
      await fetchItems(); // Refresh lista
    } catch (error) {
      alert('Greška pri brisanju: ' + error.message);
      console.error('Error deleting items:', error);
    } finally {
      setSaving(false);
    }
  };

  // sortiranje kategorija po tvom redosledu
  const categoryOrder = [
    'MESNE PRERAĐEVINE',
    'MLEČNI PROIZVODI',
    'SIREVI',
    'VOĆE I POVRĆE',
    'ŽITARICE I BRAŠNA',
    'TESTENINE',
    'KONZERVIRANI PROIZVODI',
    'ZAČINI I DODACI',
    'ULJA I SIRĆETA',
    'SLATKI PROGRAM',
    'OSTALO'
  ];

  // grupisanje artikala po kategorijama
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // sortiranje unutar svake kategorije
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  if (loading) return <div>Učitavanje...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plus className="w-6 h-6" /> Kuhinjski Popis
        </h1>
        <Link href="/history" className="text-blue-500 underline">📜 Istorija Popisa</Link>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="date"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
          className="border p-2 rounded w-1/3"
        />
        <input
          type="text"
          placeholder="Sastavio"
          value={sastavio}
          onChange={(e) => setSastavio(e.target.value)}
          className="border p-2 rounded w-2/3"
        />
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Dodaj namirnicu
        </button>
        
        <button
          onClick={toggleDeleteMode}
          className={`p-2 rounded transition-colors flex items-center gap-2 ${
            deleteMode 
              ? 'bg-gray-500 hover:bg-gray-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {deleteMode ? (
            <>
              <X className="w-4 h-4" /> Otkaži brisanje
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" /> Obriši artikle
            </>
          )}
        </button>

        {deleteMode && selectedItems.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {saving ? 'Brišem...' : `Obriši (${selectedItems.size})`}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {categoryOrder.map(category => (
          groupedItems[category] ? (
            <div key={category} className="border rounded bg-gray-50">
              <div
                className="flex justify-between items-center bg-gray-200 p-2 cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                <h2 className="font-bold">{category}</h2>
                <span>{expandedCategories[category] ? '▼' : '►'}</span>
              </div>

              {expandedCategories[category] && (
                <div className="p-2 space-y-2">
                  {groupedItems[category].map(item => (
                    <div 
                      key={`${item.id}-${item.name}`} 
                      className={`flex justify-between items-center border p-2 rounded transition-colors ${
                        selectedItems.has(item.id) 
                          ? 'bg-red-100 border-red-300' 
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {deleteMode && (
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.unit}</p>
                            </div>
                            
                            {!deleteMode && (
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Uredi artikal"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {!deleteMode && (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={quantities[item.id] || ''}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="border p-1 rounded w-24 text-right ml-2"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={saving || deleteMode}
          className={`p-3 rounded w-1/2 transition-colors ${
            deleteMode 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {saving ? 'Čuvanje...' : 'Sačuvaj Popis'}
        </button>
        <button
          onClick={() => generatePDF({
            datum,
            sastavio,
            items: items.map(item => ({
              ...item,
              quantity: parseFloat(quantities[item.id]) || 0
            }))
          })}
          disabled={deleteMode}
          className={`p-3 rounded w-1/2 transition-colors ${
            deleteMode 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          Preuzmi PDF izveštaj
        </button>
      </div>

      {showAddModal && (
        <AddItemModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          categories={[...new Set(items.map(i => i.category))]}
        />
      )}

      {showEditModal && (
        <EditItemModal
          show={showEditModal}
          onClose={handleCloseEditModal}
          item={editingItem}
          categories={[...new Set(items.map(i => i.category))]}
          onUpdate={fetchItems}
        />
      )}
    </div>
  );
}