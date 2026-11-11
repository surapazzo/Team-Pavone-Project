/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  UserCheck,
  ChevronDown,
  Layers,
  Edit3,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenCmsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenCmsModal }) => {
  const {
    currentRoute,
    setCurrentRoute,
    currentUser,
    switchUserRole,
    athletes,
    theme,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const isAppRoute = currentRoute.startsWith('/app');
  const isCoach = currentUser.role === 'COACH';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Left Zone: Sidebar Hamburger (if in app) + Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          {isAppRoute && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 lg:hidden transition-colors"
              aria-label="Apri Menu Navigazione"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setCurrentRoute('/')}
            className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            {theme.logo_url ? (
              <img
                src={theme.logo_url}
                alt="Logo Team Pavone"
                className="w-9 h-9 object-contain rounded-lg p-0.5 bg-slate-900 border border-slate-800"
              />
            ) : (
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md"
                style={{ backgroundColor: theme.accent_primary }}
              >
                TP
              </span>
            )}
            <span className="whitespace-nowrap font-bold">
              {theme.brand_name}
            </span>
          </button>
        </div>

        {/* Center Zone: Clean Single-Line Navigation Links (Only on Landing) */}
        {!isAppRoute && (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#metodo" className="whitespace-nowrap hover:text-white transition-colors">
              Il Metodo
            </a>
            <a href="#annunci" className="whitespace-nowrap hover:text-white transition-colors">
              Bacheca Annunci
            </a>
            <a href="#trasformazioni" className="whitespace-nowrap hover:text-white transition-colors">
              Trasformazioni
            </a>
            <a href="#contatti" className="whitespace-nowrap hover:text-white transition-colors">
              Candidatura Coaching
            </a>
          </nav>
        )}

        {/* Right Zone: Controls & Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* If Coach on Landing: Quick CMS Drawer Trigger */}
          {!isAppRoute && isCoach && onOpenCmsModal && (
            <button
              onClick={onOpenCmsModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-700 hover:bg-purple-600 text-white transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modifica CMS</span>
            </button>
          )}

          {/* Role Switching Selector */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-200 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="whitespace-nowrap truncate max-w-[120px]">
                {currentUser.role === 'COACH' ? 'Coach Pavone' : currentUser.full_name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 py-2 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cambia Ruolo / Persona
                </div>

                {/* Coach Option */}
                <button
                  onClick={() => {
                    switchUserRole('COACH');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    currentUser.role === 'COACH' ? 'bg-purple-950/80 font-bold text-purple-300' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">Francesco Pavone</div>
                    <div className="text-[11px] text-slate-400">Head Coach & Amministratore</div>
                  </div>
                  {currentUser.role === 'COACH' && (
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                  )}
                </button>

                <div className="border-t border-slate-800 my-1" />
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Seleziona Atleta
                </div>

                {athletes.map((ath) => (
                  <button
                    key={ath.id}
                    onClick={() => {
                      switchUserRole('ATHLETE', ath.id);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currentUser.role === 'ATHLETE' && currentUser.id === ath.id
                        ? 'bg-slate-800 font-bold text-white'
                        : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{ath.full_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {ath.initial_weight_kg}kg → {ath.target_weight_kg}kg
                      </div>
                    </div>
                    {currentUser.role === 'ATHLETE' && currentUser.id === ath.id && (
                      <span className="w-2 h-2 rounded-full bg-white" />
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
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors whitespace-nowrap"
            >
              Sito Pubblico
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentRoute('/login')}
                className="px-3 py-1.5 text-xs font-bold rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors whitespace-nowrap"
              >
                Accedi
              </button>
              <button
                onClick={() => setCurrentRoute('/app/dashboard')}
                className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5"
                style={{ backgroundColor: theme.accent_primary }}
              >
                <Layers className="w-3.5 h-3.5" />
                Area Clienti
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
