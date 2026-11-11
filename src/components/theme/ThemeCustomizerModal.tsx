/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Palette, Check, RotateCcw, X } from 'lucide-react';
import { INITIAL_THEME } from '../../data/initialData';

const PRESET_ACCENTS = [
  { name: 'Viola Team Pavone (Default)', primary: '#6D28D9', secondary: '#7C3AED' },
  { name: 'Blu Royal Agonistico', primary: '#1D4ED8', secondary: '#2563EB' },
  { name: 'Nero Carbone & Smeraldo', primary: '#059669', secondary: '#10B981' },
  { name: 'Rosso Prestazione', primary: '#DC2626', secondary: '#EF4444' },
  { name: 'Ambra & Oro', primary: '#D97706', secondary: '#F59E0B' },
];

export const ThemeCustomizerModal: React.FC = () => {
  const { theme, updateTheme, isThemeEditorOpen, setIsThemeEditorOpen } = useApp();

  const [brandName, setBrandName] = useState(theme.brand_name);
  const [accentPrimary, setAccentPrimary] = useState(theme.accent_primary);
  const [accentSecondary, setAccentSecondary] = useState(theme.accent_secondary);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isThemeEditorOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTheme({
      brand_name: brandName,
      accent_primary: accentPrimary,
      accent_secondary: accentSecondary,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleReset = () => {
    setBrandName(INITIAL_THEME.brand_name);
    setAccentPrimary(INITIAL_THEME.accent_primary);
    setAccentSecondary(INITIAL_THEME.accent_secondary);
    updateTheme(INITIAL_THEME);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-700" />
            <h2 className="text-base font-bold text-slate-900">
              Personalizzazione Tema White-Label
            </h2>
          </div>
          <button
            onClick={() => setIsThemeEditorOpen(false)}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Modifica il nome del brand e la palette colori. Le modifiche aggiornano istantaneamente le <strong>CSS Variables</strong> salvate a database su tutto l'ecosistema web e mobile (TC-QA-03).
        </p>

        {savedNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Tema salvato! Variabili CSS aggiornate a runtime.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nome del Brand / Team</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-2">Preset Colori White-Label</label>
            <div className="space-y-1.5">
              {PRESET_ACCENTS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setAccentPrimary(p.primary);
                    setAccentSecondary(p.secondary);
                  }}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    accentPrimary === p.primary ? 'border-purple-600 bg-purple-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold text-slate-800">{p.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.primary }} />
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.secondary }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Colore Primario Hex</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentPrimary}
                  onChange={(e) => setAccentPrimary(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={accentPrimary}
                  onChange={(e) => setAccentPrimary(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Colore Secondario Hex</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentSecondary}
                  onChange={(e) => setAccentSecondary(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={accentSecondary}
                  onChange={(e) => setAccentSecondary(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ripristina Default
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsThemeEditorOpen(false)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Chiudi
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-bold text-white rounded-lg shadow-sm"
                style={{ backgroundColor: accentPrimary }}
              >
                Applica Tema Live
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
