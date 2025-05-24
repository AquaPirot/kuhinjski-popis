import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import AddItemModal from './AddItemModal';
import { generatePDF } from '../utils/pdfGenerator';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function KuhinjskiPopis() {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]);
  const [sastavio, setSastavio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // kontrola za expand/collapse
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, 'namirnice'));
      const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemList);

      // inicijalno otvori sve kategorije
      const initialExpanded = {};
      categoryOrder.forEach(cat => {
        initialExpanded[cat] = true;
      });
      setExpandedCategories(initialExpanded);

      setLoading(false);
    };
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

      <button
        onClick={() => setShowAddModal(true)}
        className="bg-blue-500 text-white p-2 rounded mb-4"
      >
        + Dodaj novu namirnicu
      </button>

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
                    <div key={item.id} className="flex justify-between items-center border p-2 rounded bg-white">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.unit}</p>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={quantities[item.id] || ''}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="border p-1 rounded w-24 text-right"
                      />
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
          disabled={saving}
          className="bg-green-500 text-white p-3 rounded w-1/2"
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
          className="bg-purple-500 text-white p-3 rounded w-1/2"
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
    </div>
  );
}
