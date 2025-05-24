import React from 'react';
import KuhinjskiPopis from '../components/KuhinjskiPopis';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <KuhinjskiPopis />

        {/* Dugme za istoriju */}
        <div className="text-center mt-10">
          <Link href="/history">
            <span className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-emerald-700 transition-all font-semibold text-sm">
              📜 Pogledaj istoriju popisa
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
