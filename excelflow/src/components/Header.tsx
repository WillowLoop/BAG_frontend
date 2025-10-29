/**
 * Header Component
 *
 * Application header with logo/branding.
 * Features a gradient background and backdrop blur effect.
 */

import { FileSpreadsheet } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ExcelFlow</h1>
            <p className="text-sm text-gray-600">Analyseer je Excel-bestanden in seconden</p>
          </div>
        </div>
      </div>
    </header>
  );
}
