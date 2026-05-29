import React, { useState } from 'react';
import { Plus, X, Package, Tag, Scale, AlertCircle } from 'lucide-react';
import { addItem } from '@/utils/storage';

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
  { value: 'kut', label: 'kut (kutija)', icon: '📦' },
];

const PREDEFINED_CATEGORIES = [
  'Meso i riba',
  'Mlečni proizvodi',
  'Voće i povrće',
  'Žitarice i brašno',
  'Konzervirana hrana',
  'Začini i dodaci',
  'Slatkiši',
  'Napici',
];

export default function AddItemModal({ show, onClose, categories, onUpdate, showToast }) {
  const [formData, setFormData] = useState({ name: '', category: '', unit: 'kg' });
  const [saving, setSaving] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const finalCategory = showCustomCategory ? customCategory.trim() : formData.category;

    if (!formData.name.trim() || !finalCategory) {
      setError('Popunite naziv i kategoriju!');
      return;
    }

    setSaving(true);
    try {
      addItem(formData.name, finalCategory, formData.unit);
      showToast('Namirnica uspešno dodana!', 'success');
      setFormData({ name: '', category: '', unit: 'kg' });
      setShowCustomCategory(false);
      setCustomCategory('');
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.message || 'Greška pri dodavanju namirnice');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', category: '', unit: 'kg' });
    setShowCustomCategory(false);
    setCustomCategory('');
    setError('');
    onClose();
  };

  if (!show) return null;

  const allCategories = [...new Set([...PREDEFINED_CATEGORIES, ...categories])];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-up">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Dodaj novu namirnicu</h2>
                <p className="text-green-100 text-sm">Unesite detalje o novom artiklu</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4" />
              <span>Naziv artikla</span>
            </label>
            <input
              type="text"
              placeholder="npr. Piletina belo meso"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400"
              autoFocus
            />
          </div>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">Izaberite kategoriju</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCustomCategory(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
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
                  className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => { setShowCustomCategory(false); setCustomCategory(''); }}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  ← Vrati se na postojeće kategorije
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Scale className="w-4 h-4" />
              <span>Jedinica mere</span>
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              {UNIT_OPTIONS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.icon} {unit.label}
                </option>
              ))}
            </select>
          </div>

          {formData.name && (showCustomCategory ? customCategory : formData.category) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Pregled:</h4>
              <div className="text-lg font-semibold text-gray-900">{formData.name}</div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg">
                  {showCustomCategory ? customCategory : formData.category}
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg">
                  {UNIT_OPTIONS.find((u) => u.value === formData.unit)?.label}
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl transition-colors font-medium"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={
                saving ||
                !formData.name.trim() ||
                !(showCustomCategory ? customCategory.trim() : formData.category)
              }
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Čuvam...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Dodaj artikal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
