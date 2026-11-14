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
  Globe,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SUPPORTED_LOCALES, useTranslation } from '../../i18n/useTranslation';
import { SupportedLocale } from '../../types';

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
    landingContent,
    locale,
    setLocale,
    setIsOnboardingModalOpen,
  } = useApp();
  const { t } = useTranslation();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const isAppRoute = currentRoute.startsWith('/app');
  const isCoach = currentUser.role === 'COACH';

  const visibleNavLinks = (landingContent.nav_links || []).filter((link) => link.visible !== false);

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white transition-colors">
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Zone: Sidebar Hamburger (if in app) + Brand Wordmark */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
          {isAppRoute && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 lg:hidden transition-colors shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Apri Menu Navigazione"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setCurrentRoute('/')}
            className="font-extrabold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity min-w-0 cursor-pointer"
          >
            {theme.logo_url ? (
              <img
                src={theme.logo_url}
                alt={`Logo ${theme.brand_name}`}
                referrerPolicy="no-referrer"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg p-0.5 bg-slate-900 border border-slate-800 shrink-0"
              />
            ) : (
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shrink-0"
                style={{ backgroundColor: theme.accent_primary }}
              >
                TP
              </span>
            )}
            <span className="truncate font-bold text-sm sm:text-lg max-w-[92px] sm:max-w-none">
              {theme.brand_name}
            </span>
          </button>
        </div>

        {/* Center Zone: Clean Single-Line Navigation Links Controlled by CMS (Only on Landing) */}
        {!isAppRoute && (
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-semibold text-slate-300 min-w-0">
            {visibleNavLinks.map((link) => (
              <a
                key={link.id}
                href={link.href || '#'}
                className="whitespace-nowrap shrink-0 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Zone: Controls & Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Language Switcher (IT/EN/ES/DE/FR) */}
          <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] sm:text-xs">
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400 shrink-0 hidden sm:block" />
            <select
              aria-label="Seleziona lingua"
              value={locale}
              onChange={(e) => setLocale(e.target.value as SupportedLocale)}
              className="bg-transparent text-slate-200 font-bold text-[11px] sm:text-xs focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LOCALES.map((loc) => (
                <option key={loc.code} value={loc.code} className="bg-slate-900 text-white">
                  {loc.code.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {!isAppRoute && (
            <button
              onClick={() => setIsOnboardingModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{landingContent.nav_onboarding_label || t('onboarding.start_cta')}</span>
            </button>
          )}

          {/* If Coach on Landing: Quick CMS Drawer Trigger */}
          {!isAppRoute && isCoach && onOpenCmsModal && (
            <button
              onClick={onOpenCmsModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-700 hover:bg-purple-600 text-white transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span>Modifica CMS</span>
            </button>
          )}

          {/* Role Switching Selector */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-200 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate max-w-[66px] sm:max-w-[125px]">
                {currentUser.role === 'COACH' ? 'Coach' : currentUser.full_name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1rem)] bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 py-2 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cambia Ruolo / Persona
                </div>

                {/* Coach Option */}
                <button
                  onClick={() => {
                    switchUserRole('COACH');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
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
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
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
              title={landingContent.nav_public_site_label || 'Vai al Sito Pubblico'}
              className="px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:hidden" />
              <span className="hidden sm:inline">{landingContent.nav_public_site_label || 'Sito Pubblico'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setCurrentRoute('/login')}
                className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                {landingContent.nav_login_label || 'Accedi'}
              </button>
              <button
                onClick={() => setCurrentRoute('/app/dashboard')}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white rounded-lg shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: theme.accent_primary }}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>{landingContent.nav_app_label || 'App'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
