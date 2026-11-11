/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Edit3, Check, Palette, Sparkles, LayoutDashboard } from 'lucide-react';

export const CoachEditorBar: React.FC = () => {
  const { currentUser, landingContent, updateLandingContent, setCurrentRoute, setIsThemeEditorOpen } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(landingContent.hero_title);
  const [draftSubtitle, setDraftSubtitle] = useState(landingContent.hero_subtitle);

  if (currentUser.role !== 'COACH') return null;

  const handleSave = () => {
    updateLandingContent({
      hero_title: draftTitle,
      hero_subtitle: draftSubtitle,
    });
    setIsEditing(false);
  };

  return (
    <aside aria-label="Modalità Editor Coach" className="bg-slate-900 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-purple-300 flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5" />
          Modalità Editor Coach
        </span>
        <span className="text-slate-400 hidden sm:inline">|</span>
        <span className="text-slate-300 hidden sm:inline">
          {currentUser.full_name} (Head Coach)
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Titolo Hero..."
              className="px-2 py-1 text-slate-900 bg-white rounded text-xs w-48 sm:w-64"
            />
            <button
              onClick={handleSave}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-medium flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Salva CMS
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
            >
              Annulla
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setDraftTitle(landingContent.hero_title);
              setDraftSubtitle(landingContent.hero_subtitle);
              setIsEditing(true);
            }}
            className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 rounded text-white font-medium flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3" /> Modifica Testi Hero
          </button>
        )}

        <button
          onClick={() => setIsThemeEditorOpen(true)}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 font-medium flex items-center gap-1 transition-colors"
        >
          <Palette className="w-3 h-3 text-purple-400" /> White-Label
        </button>

        <button
          onClick={() => setCurrentRoute('/app/dashboard')}
          className="px-3 py-1 bg-white text-slate-900 hover:bg-slate-100 rounded font-semibold flex items-center gap-1 transition-colors ml-2"
        >
          <LayoutDashboard className="w-3 h-3 text-purple-700" /> Area Riservata
        </button>
      </div>
    </aside>
  );
};
