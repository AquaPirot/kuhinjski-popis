// src/components/EditItemModal.js - Modern Design
import React, { useState, useEffect } from 'react';
import { Edit3, Save, X, Package, Tag, Scale, Trash2 } from 'lucide-react';

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg (kilogram)', icon: '⚖️' },
  { value: 'g', label: 'g (gram)', icon: '⚖️' },
  { value: 'lit', label: 'lit (litar)', icon: '🥤' },
  { value: 'ml', label: 'ml (mililitar)', icon: '🥤' },
  { value: 'kom', label: 'kom (komad)', icon: '📦' },
  { value: 'pak', label: 'pak (pakovanje)', icon: '📦' },
  { value: 'konz', label: 'konz (konzerva)', icon: '🥫' },
  { value: 'teg', label: 'teg (tegla)', icon: '🫙' },
  { value: 'fla', label: 'fla (flaša)', icon: '🍶' },
  { value: 'kut', label: 'kut (kutija)', icon: '📦' }
];

const PREDEFINED_CATEGORIES = [
  'Meso i riba',
  'Mlečni proizvodi', 
  'Voće i povrće',
  'Žitarice i brašno',
  'Konzervirana hrana',
  'Začini i dodaci',
  'Slatkiši',
  'Napici'
];

export default function EditItemModal({ show, onClose, item, categories, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'kg'
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        unit: item.unit || 'kg'
      });
      
      // Proverava da li je kategorija custom (nije u predefinisanim)
      const allCategories = [...new Set([...PREDEFINED_CATEGORIES, ...categories])];
      if (item.category && !allCategories.includes(item.category)) {
        setShowCustomCategory(true);
        setCustomCategory(item.category);
      }
    }
  }, [item, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalCategory = showCustomCategory ? customCategory.trim() : formData.category;
    
    if (!formData.name.trim() || !finalCategory) {
      alert('Popunite naziv i kategoriju!');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/namirnice/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          name: formData.name.trim(),
          category: finalCategory,
          unit: formData.unit
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Artikal uspešno ažuriran!');
        onUpdate(); // Refresh lista
        handleClose();
      } else {
        alert(result.error || 'Greška pri ažuriranju artikla');
      }
    } catch (error) {
      alert('Greška: ' + error.message);
      console.error('Error updating item:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Da li ste sigurni da želite da obrišete "${item.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/namirnice/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: item.id }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Artikal uspešno obrisan!');
        onUpdate(); // Refresh lista
        handleClose();
      } else {
        alert(result.error || 'Greška pri brisanju artikla');
      }
    } catch (error) {
      alert('Greška: ' + error.message);
      console.error('Error deleting item:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', category: '', unit: 'kg' });
    setShowCustomCategory(false);
    setCustomCategory('');
    onClose();
  };

  if (!show || !item) return null;

  // Kombinuj postojeće kategorije sa predefinisanim
  const allCategories = [...new Set([...PREDEFINED_CATEGORIES, ...categories])];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Uredi artikal</h2>
                <p className="text-blue-100 text-sm">Izmeni detalje artikla</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Naziv */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4" />
              <span>Naziv artikla</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Unesite naziv artikla"
            />
          </div>

          {/* Kategorija */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Tag className="w-4 h-4" />
              <span>Kategorija</span>
            </label>
            
            {!showCustomCategory ? (
              <div className="space-y-3">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Izaberite kategoriju</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => setShowCustomCategory(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Dodaj novu kategoriju
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Unesite novu kategoriju"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory('');
                    setFormData({ ...formData, category: item.category });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  ← Vrati se na postojeće kategorije
                </button>
              </div>
            )}
          </div>

          {/* Jedinica mere */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Scale className="w-4 h-4" />
              <span>Jedinica mere</span>
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {UNIT_OPTIONS.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.icon} {unit.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          {formData.name && (showCustomCategory ? customCategory : formData.category) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Pregled izmena:</h4>
              <div className="text-lg font-semibold text-gray-900">{formData.name}</div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg">
                  {showCustomCategory ? customCategory : formData.category}
                </span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg">
                  {UNIT_OPTIONS.find(u => u.value === formData.unit)?.label}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-100 hover:bg-red-200 text-red-700 py-3 px-4 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                  <span>Brišem...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Obriši</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl transition-colors font-medium"
            >
              Otkaži
            </button>
            
            <button
              type="submit"
              disabled={saving || !formData.name.trim() || !(showCustomCategory ? customCategory.trim() : formData.category)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Čuvam...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Sačuvaj izmene</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}