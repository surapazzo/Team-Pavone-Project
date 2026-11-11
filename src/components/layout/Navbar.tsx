/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Layers,
  Palette,
  ExternalLink,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    currentUser,
    switchUserRole,
    athletes,
    theme,
    setIsPreMergeGateOpen,
    setIsThemeEditorOpen,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const isAppRoute = currentRoute.startsWith('/app');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentRoute('/')}
            className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm"
              style={{ backgroundColor: theme.accent_primary }}
            >
              TP
            </span>
            <span className="whitespace-nowrap font-bold">
              {theme.brand_name}
            </span>
          </button>

          {isAppRoute && (
            <span
              className="hidden lg:inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: currentUser.role === 'COACH' ? '#6D28D9' : '#0F172A' }}
            >
              {currentUser.role === 'COACH' ? 'VISTA COACH' : 'VISTA ATLETA'}
            </span>
          )}
        </div>

        {/* Zone 2: 4–5 single-line clean text links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {isAppRoute ? (
            <>
              <button
                onClick={() => setCurrentRoute('/app/dashboard')}
                className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
                  currentRoute === '/app/dashboard'
                    ? 'font-bold text-slate-900 border-b-2 py-5'
                    : 'py-5'
                }`}
                style={currentRoute === '/app/dashboard' ? { borderColor: theme.accent_primary } : {}}
              >
                Dashboard & KPI
              </button>
              <button
                onClick={() => setCurrentRoute('/app/calendar')}
                className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
                  currentRoute === '/app/calendar'
                    ? 'font-bold text-slate-900 border-b-2 py-5'
                    : 'py-5'
                }`}
                style={currentRoute === '/app/calendar' ? { borderColor: theme.accent_primary } : {}}
              >
                Macrociclo & Fasi
              </button>
              <button
                onClick={() => setCurrentRoute('/app/workouts')}
                className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
                  currentRoute === '/app/workouts'
                    ? 'font-bold text-slate-900 border-b-2 py-5'
                    : 'py-5'
                }`}
                style={currentRoute === '/app/workouts' ? { borderColor: theme.accent_primary } : {}}
              >
                Schede & Nutrizione
              </button>
              <button
                onClick={() => setCurrentRoute('/app/check-in')}
                className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
                  currentRoute === '/app/check-in'
                    ? 'font-bold text-slate-900 border-b-2 py-5'
                    : 'py-5'
                }`}
                style={currentRoute === '/app/check-in' ? { borderColor: theme.accent_primary } : {}}
              >
                Check-In Settimanale
              </button>
              <button
                onClick={() => setCurrentRoute('/app/privacy-gdpr')}
                className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
                  currentRoute === '/app/privacy-gdpr'
                    ? 'font-bold text-slate-900 border-b-2 py-5'
                    : 'py-5'
                }`}
                style={currentRoute === '/app/privacy-gdpr' ? { borderColor: theme.accent_primary } : {}}
              >
                Privacy & GDPR
              </button>
            </>
          ) : (
            <>
              <a href="#metodo" className="whitespace-nowrap hover:text-slate-900 transition-colors">
                Metodo
              </a>
              <a href="#annunci" className="whitespace-nowrap hover:text-slate-900 transition-colors">
                Bacheca Annunci
              </a>
              <a href="#trasformazioni" className="whitespace-nowrap hover:text-slate-900 transition-colors">
                Trasformazioni
              </a>
              <a href="#contatti" className="whitespace-nowrap hover:text-slate-900 transition-colors">
                Candidatura
              </a>
            </>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action Area / Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Pre-Merge Gate Test Suite Launcher */}
          <button
            onClick={() => setIsPreMergeGateOpen(true)}
            title="Esegui Pre-Merge Gate Test Suite (TC-SEC & TC-QA)"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="whitespace-nowrap">Gate CI/CD (11 Test)</span>
          </button>

          {/* White-Label Theme Customizer */}
          <button
            onClick={() => setIsThemeEditorOpen(true)}
            title="Personalizza Colori e Brand White-Label"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Personalizza Tema"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Role Switching Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-800 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" style={{ color: theme.accent_primary }} />
              <span className="whitespace-nowrap truncate max-w-[120px]">
                {currentUser.role === 'COACH' ? 'Coach Pavone' : currentUser.full_name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Cambia Ruolo / Persona
                </div>

                {/* Coach Option */}
                <button
                  onClick={() => {
                    switchUserRole('COACH');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-purple-50 transition-colors ${
                    currentUser.role === 'COACH' ? 'bg-purple-50 font-bold text-purple-950' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold">Francesco Pavone</div>
                    <div className="text-[11px] text-slate-500">Head Coach & Amministratore</div>
                  </div>
                  {currentUser.role === 'COACH' && (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent_primary }} />
                  )}
                </button>

                <div className="border-t border-slate-100 my-1" />
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Seleziona Atleta
                </div>

                {athletes.map((ath) => (
                  <button
                    key={ath.id}
                    onClick={() => {
                      switchUserRole('ATHLETE', ath.id);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentUser.role === 'ATHLETE' && currentUser.id === ath.id
                        ? 'bg-slate-100 font-bold text-slate-900'
                        : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div>{ath.full_name}</div>
                      <div className="text-[10px] text-slate-500">
                        {ath.initial_weight_kg}kg → {ath.target_weight_kg}kg
                      </div>
                    </div>
                    {currentUser.role === 'ATHLETE' && currentUser.id === ath.id && (
                      <span className="w-2 h-2 rounded-full bg-slate-900" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          {isAppRoute ? (
            <button
              onClick={() => setCurrentRoute('/')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentRoute('/app/dashboard')}
              className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5"
              style={{ backgroundColor: theme.accent_primary }}
            >
              <Layers className="w-3.5 h-3.5" />
              Area Clienti
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
