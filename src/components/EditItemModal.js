// src/components/EditItemModal.js
import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Edit3, Save, X } from 'lucide-react';

export default function EditItemModal({ show, onClose, item, categories, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'kg'
  });
  const [saving, setSaving] = useState(false);

  // Popuni formu kada se otvori modal
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        unit: item.unit || 'kg'
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) {
      alert('Popunite naziv i kategoriju!');
      return;
    }

    setSaving(true);
    try {
      const itemRef = doc(db, 'namirnice', item.id);
      await updateDoc(itemRef, {
        name: formData.name.trim(),
        category: formData.category,
        unit: formData.unit
      });
      
      alert('Artikal uspešno ažuriran!');
      onUpdate(); // Refresh lista
      onClose();
    } catch (error) {
      alert('Greška: ' + error.message);
      console.error('Error updating item:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!show || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Edit3 className="w-5 h-5" /> Uredi artikal
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Unesite naziv artikla"
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
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Čuvam...' : 'Sačuvaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}