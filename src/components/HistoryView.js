// src/components/HistoryView.js - CLEAN COMPLETE VERSION
import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';

export default function HistoryView({ onBack }) {
  const [popisi, setPopisi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPopis, setExpandedPopis] = useState(null);

  useEffect(() => {
    fetchPopisi();
  }, []);

  const fetchPopisi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching popisi...');
      
      const response = await fetch('/api/popisi/list');
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('API Response:', result);
      
      if (result.success) {
        console.log('Popisi data:', result.data?.length || 0, 'items');
        setPopisi(result.data || []);
      } else {
        console.error('API returned error:', result.error);
        setError(result.error || 'Nepoznata greška pri učitavanju popisa');
      }
    } catch (error) {
      console.error('Error fetching popisi:', error);
      setError('Greška pri učitavanju popisa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePopis = async (id) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj popis?')) {
      return;
    }

    try {
      const response = await fetch('/api/popisi/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Popis uspešno obrisan!');
        fetchPopisi();
      } else {
        alert('Greška pri brisanju: ' + result.error);
      }
    } catch (error) {
      alert('Greška pri brisanju: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '0000-00-00 00:00:00') {
      return 'Nepoznat datum';
    }
    
    try {
      let date;
      
      if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        date = new Date(dateString.replace(' ', 'T') + 'Z');
      } else if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleString('sr-RS', {
        timeZone: 'Europe/Belgrade',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date parsing error:', error, 'for date:', dateString);
      return dateString;
    }
  };

  const exportToPDF = (popis) => {
    const items = popis.items || [];
    
    const content = `
KUHINJSKI POPIS
================

Datum: ${popis.srpski_datum || formatDate(popis.datum)}
Sastavio: ${popis.sastavio}

ARTIKLI:
--------
${items.map((item, index) => 
  `${index + 1}. ${item.name || 'Nepoznat artikal'} - ${item.quantity || 0} ${item.unit || ''}`
).join('\n')}

Ukupno artikala: ${items.length}
Ukupna količina: ${items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0).toFixed(2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popis_${popis.id}_${(popis.sastavio || 'nepoznato').replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredPopisi = popisi.filter(popis => {
    const searchLower = searchTerm.toLowerCase();
    const items = popis.items || [];
    
    return (
      (popis.sastavio || '').toLowerCase().includes(searchLower) ||
      (popis.srpski_datum || formatDate(popis.datum) || '').includes(searchTerm) ||
      items.some(item => (item.name || '').toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Istorija Popisa</h1>
                  <p className="text-sm text-gray-500">
                    {loading ? 'Učitavanje...' : `${filteredPopisi.length} sačuvanih popisa`}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchPopisi}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Osvezi listu"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pretraži popise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <h4 className="font-semibold text-yellow-800">Debug Info:</h4>
            <p className="text-sm text-yellow-700">
              Loading: {loading.toString()}, 
              Error: {error || 'none'}, 
              Total popisi: {popisi.length}, 
              Filtered: {filteredPopisi.length}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Učitavanje istorije...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Greška pri učitavanju</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchPopisi}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Pokušaj ponovo</span>
            </button>
          </div>
        ) : filteredPopisi.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {popisi.length === 0 ? 'Nema sačuvanih popisa' : 'Nema rezultata pretrage'}
            </h3>
            <p className="text-gray-500">
              {popisi.length === 0 
                ? 'Kada napravite i sačuvate popis, prikazaće se ovde.' 
                : 'Pokušajte sa drugim terminom pretrage.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPopisi.map(popis => {
              const isExpanded = expandedPopis === popis.id;
              const items = popis.items || [];
              const totalItems = items.length;
              const totalQuantity = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
              
              return (
                <div key={popis.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {popis.srpski_datum || formatDate(popis.datum)}
                            </h3>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                              {totalItems} artikala
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{popis.sastavio}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Package className="w-4 h-4" />
                              <span>Ukupno: {totalQuantity.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportToPDF(popis)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Preuzmi kao TXT"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => setExpandedPopis(isExpanded ? null : popis.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={isExpanded ? "Sakrij detalje" : "Prikaži detalje"}
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        
                        <button
                          onClick={() => deletePopis(popis.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Obriši popis"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-6 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span>Detaljan popis artikala</span>
                      </h4>
                      
                      {items.length === 0 ? (
                        <p className="text-gray-500 italic">Nema artikala u ovom popisu.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {items.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 text-sm">{item.name || 'Nepoznat artikal'}</h5>
                                  <p className="text-xs text-gray-500">{item.category || 'Nepoznata kategorija'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-purple-600">
                                    {item.quantity || 0} {item.unit || ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Summary */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span className="text-gray-600">Ukupno artikala: <span className="font-semibold">{totalItems}</span></span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                              <span className="text-gray-600">Ukupna količina: <span className="font-semibold">{totalQuantity.toFixed(2)}</span></span>
                            </div>
                          </div>
                          
                          <div className="text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {popis.srpski_datum || formatDate(popis.datum)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}