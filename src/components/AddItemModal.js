// src/components/AddItemModal.js
import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Plus, X } from 'lucide-react';

export default function AddItemModal({ show, onClose, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'kg'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) {
      alert('Popunite naziv i kategoriju!');
      return;
    }

    setSaving(true);
    try {
      // Proveri da li već postoji artikal sa istim nazivom
      const existingItemQuery = query(
        collection(db, 'namirnice'), 
        where('name', '==', formData.name.trim())
      );
      const existingItem = await getDocs(existingItemQuery);
      
      if (!existingItem.empty) {
        alert('Namirnica sa tim nazivom već postoji!');
        setSaving(false);
        return;
      }

      await addDoc(collection(db, 'namirnice'), {
        name: formData.name.trim(),
        category: formData.category,
        unit: formData.unit
      });
      
      alert('Namirnica dodana u bazu!');
      setFormData({ name: '', category: '', unit: 'kg' });
      onClose();
    } catch (error) {
      alert('Greška: ' + error.message);
      console.error('Error adding item:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Dodaj novu namirnicu
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Naziv:</label>
            <input
              type="text"
              placeholder="Unesite naziv"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategorija:</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Izaberi kategoriju</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Jedinica mere:</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="kg">kg (kilogram)</option>
              <option value="g">g (gram)</option>
              <option value="lit">lit (litar)</option>
              <option value="ml">ml (mililitar)</option>
              <option value="kom">kom (komad)</option>
              <option value="pak">pak (pakovanje)</option>
              <option value="konz">konz (konzerva)</option>
              <option value="teg">teg (tegla)</option>
              <option value="fla">fla (flaša)</option>
              <option value="kut">kut (kutija)</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors"
            >
              {saving ? 'Čuvam...' : 'Dodaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}