// src/components/AddItemModal.js
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Plus } from 'lucide-react';

export default function AddItemModal({ show, onClose, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'kg'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      alert('Popunite naziv i kategoriju!');
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'namirnice'), formData);
      alert('Namirnica dodana u bazu!');
      setFormData({ name: '', category: '', unit: 'kg' });
      onClose();
    } catch (error) {
      alert('Greška: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Dodaj novu namirnicu
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Naziv"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="">Izaberi kategoriju</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="lit">lit</option>
            <option value="ml">ml</option>
            <option value="kom">kom</option>
            <option value="pak">pak</option>
            <option value="konz">konz</option>
            <option value="teg">teg</option>
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white p-2 rounded"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-500 text-white p-2 rounded"
            >
              {saving ? 'Čuvam...' : 'Dodaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
