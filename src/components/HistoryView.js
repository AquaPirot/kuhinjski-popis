// src/components/HistoryView.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Calendar, Trash2, Download } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import Link from 'next/link';

export default function HistoryView() {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'popisi'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLists(data);
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'popisi', id));
    setLists(lists.filter(l => l.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          📜 Istorija Popisa
        </h1>
        <Link href="/" className="text-blue-500 underline">← Nazad na početnu</Link>
      </div>

      {lists.length === 0 ? (
        <p className="text-gray-600">Nema sačuvanih popisa.</p>
      ) : (
        <div className="space-y-4">
          {lists.map(list => (
            <div key={list.id} className="border p-4 rounded bg-white shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold">📅 {list.datum}</p>
                <p className="text-sm text-gray-600">Sastavio: {list.sastavio}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => generatePDF(list)}
                  className="bg-purple-500 text-white p-2 rounded"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button
                  onClick={() => handleDelete(list.id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  <Trash2 className="w-4 h-4" /> Obriši
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
