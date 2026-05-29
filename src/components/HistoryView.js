import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Trash2,
  Download,
  Search,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { getAllPopisi, deletePopis, getDaysRemaining } from '@/utils/storage';
import { useToast, ToastContainer } from './Toast';

function SkeletonRow() {
  return (
    <div className="bg-white rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
          <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function DaysRemainingBadge({ datum }) {
  const days = getDaysRemaining(datum);
  if (days > 7) return null;

  let cls = 'bg-yellow-100 text-yellow-700';
  let label = `${days}d do brisanja`;

  if (days <= 0) {
    cls = 'bg-red-100 text-red-700';
    label = 'Ističe danas';
  } else if (days <= 2) {
    cls = 'bg-red-100 text-red-700';
  } else if (days <= 5) {
    cls = 'bg-orange-100 text-orange-700';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function HistoryView({ onBack }) {
  const [popisi, setPopisi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPopis, setExpandedPopis] = useState(null);

  const { toasts, showToast } = useToast();

  const fetchPopisi = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const data = getAllPopisi();
      setPopisi(data);
    } catch (err) {
      setError('Greška pri učitavanju popisa: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopisi();
  }, [fetchPopisi]);

  const handleDelete = (id) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj popis?')) return;
    try {
      deletePopis(id);
      setPopisi((prev) => prev.filter((p) => p.id !== id));
      showToast('Popis uspešno obrisan!', 'success');
    } catch (err) {
      setError('Greška pri brisanju: ' + err.message);
    }
  };

  const filteredPopisi = popisi.filter((popis) => {
    const lower = searchTerm.toLowerCase();
    const items = popis.items || [];
    return (
      (popis.sastavio || '').toLowerCase().includes(lower) ||
      (popis.srpski_datum || '').includes(searchTerm) ||
      items.some((item) => (item.name || '').toLowerCase().includes(lower))
    );
  });

  const exportCSV = () => {
    if (filteredPopisi.length === 0) {
      showToast('Nema podataka za izvoz', 'info');
      return;
    }

    const rows = [['Datum', 'Sastavio', 'Artikal', 'Kategorija', 'Količina', 'Jedinica']];
    filteredPopisi.forEach((popis) => {
      const dateStr = popis.srpski_datum || new Date(popis.datum).toLocaleString('sr-RS');
      (popis.items || []).forEach((item) => {
        rows.push([dateStr, popis.sastavio, item.name, item.category, String(item.quantity), item.unit]);
      });
    });

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kuhinjski-popis-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV fajl preuzet!', 'success');
  };

  const handlePrint = () => {
    setExpandedPopis('__all__');
    setTimeout(() => window.print(), 150);
  };

  const handleBack = onBack || (() => { window.location.href = '/'; });

  const printDate = new Date().toLocaleString('sr-RS', { timeZone: 'Europe/Belgrade' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Print-only header */}
      <div className="hidden print-header mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kuhinjski Popis — Istorija</h1>
        <p className="text-sm text-gray-500">Odštampano: {printDate}</p>
      </div>

      {/* Nav header */}
      <div className="bg-white shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4 gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Istorija Popisa</h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {loading ? 'Učitavanje...' : `${filteredPopisi.length} sačuvanih popisa`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={fetchPopisi}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Osveži listu"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={exportCSV}
                className="hidden sm:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                title="Izvezi CSV"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                title="Štampaj / Sačuvaj PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Štampaj</span>
              </button>
            </div>
          </div>

          {/* Search row */}
          <div className="pb-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pretraži popise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            {/* Mobile export buttons */}
            <button
              onClick={exportCSV}
              className="sm:hidden p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              title="Izvezi CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="sm:hidden p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
              title="Štampaj"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">Greška pri učitavanju</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchPopisi}
              className="text-red-600 hover:text-red-800 text-sm underline flex-shrink-0"
            >
              Pokušaj ponovo
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filteredPopisi.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {popisi.length === 0 ? 'Nema sačuvanih popisa' : 'Nema rezultata pretrage'}
            </h3>
            <p className="text-gray-500 text-sm">
              {popisi.length === 0
                ? 'Kada napravite i sačuvate popis, prikazaće se ovde.'
                : 'Pokušajte sa drugim terminom pretrage.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPopisi.map((popis, popisIdx) => {
              const isExpanded = expandedPopis === popis.id || expandedPopis === '__all__';
              const items = popis.items || [];
              const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
              const isLast = popisIdx === filteredPopisi.length - 1;

              return (
                <div
                  key={popis.id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg animate-fade-up ${!isLast ? 'print-break' : ''}`}
                >
                  {/* Card header */}
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-11 h-11 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {popis.srpski_datum || new Date(popis.datum).toLocaleString('sr-RS')}
                            </h3>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                              {items.length} artikala
                            </span>
                            <DaysRemainingBadge datum={popis.datum} />
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              <span>{popis.sastavio}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              <span>Ukupno: {totalQty.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0 no-print">
                        <button
                          onClick={() => setExpandedPopis(isExpanded ? null : popis.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={isExpanded ? 'Sakrij detalje' : 'Prikaži detalje'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(popis.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Obriši popis"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded items — always rendered, hidden via CSS so print can show it */}
                  <div className={`${isExpanded ? 'block' : 'hidden'} print-expand bg-gray-50 p-4 sm:p-6`}>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>Detaljan popis artikala</span>
                    </h4>

                    {items.length === 0 ? (
                      <p className="text-gray-500 italic text-sm">Nema artikala u ovom popisu.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 text-sm truncate">
                                  {item.name || 'Nepoznat artikal'}
                                </h5>
                                <p className="text-xs text-gray-500">
                                  {item.category || 'Nepoznata kategorija'}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <p className="font-semibold text-purple-600 text-sm">
                                  {item.quantity} {item.unit}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 flex-wrap gap-2">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                          Artikala: <strong className="text-gray-700">{items.length}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-pink-500 rounded-full" />
                          Ukupna količina: <strong className="text-gray-700">{totalQty.toFixed(2)}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {popis.srpski_datum || new Date(popis.datum).toLocaleString('sr-RS')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
