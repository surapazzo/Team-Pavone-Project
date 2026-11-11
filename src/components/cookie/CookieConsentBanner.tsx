/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cookie, Shield, Check, X, Settings2, Info, ChevronRight, Lock } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const {
    cookiePreferences,
    updateCookiePreferences,
    isCookieModalOpen,
    setIsCookieModalOpen,
    setCurrentRoute,
    theme,
  } = useApp();

  // Modal custom state
  const [prefFunctional, setPrefFunctional] = useState(cookiePreferences.preferences);
  const [prefAnalytics, setPrefAnalytics] = useState(cookiePreferences.analytics);

  const handleAcceptAll = () => {
    updateCookiePreferences({
      necessary: true,
      preferences: true,
      analytics: true,
    });
    setIsCookieModalOpen(false);
  };

  const handleRejectNonNecessary = () => {
    updateCookiePreferences({
      necessary: true,
      preferences: false,
      analytics: false,
    });
    setIsCookieModalOpen(false);
  };

  const handleSaveCustom = () => {
    updateCookiePreferences({
      necessary: true,
      preferences: prefFunctional,
      analytics: prefAnalytics,
    });
    setIsCookieModalOpen(false);
  };

  return (
    <>
      {/* 1. Floating Bottom Banner (shown if not yet consented) */}
      {!cookiePreferences.hasConsented && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-white shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left Content */}
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Informativa Cookie & Protezione Dati (GDPR)</h3>
                  <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-semibold text-slate-300 rounded border border-slate-700">
                    GDPR & ePrivacy
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Questo portale utilizza cookie tecnici indispensabili per la gestione della sessione e l'autenticazione sicura dell'atleta. Con il tuo consenso, utilizziamo cookie di preferenza e telemetria prestazionale (con IP anonimizzato) per ottimizzare l'esperienza d'uso e la sincronizzazione dei dati fisiologici.
                </p>
                <div className="flex items-center gap-4 text-[11px] text-purple-400 font-semibold pt-0.5">
                  <button
                    onClick={() => setCurrentRoute('/app/privacy-gdpr')}
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>Leggi la Privacy & Cookie Policy Completa</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 text-xs font-semibold">
              <button
                onClick={() => setIsCookieModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Personalizza
              </button>

              <button
                onClick={handleRejectNonNecessary}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                Solo Tecnici
              </button>

              <button
                onClick={handleAcceptAll}
                className="px-5 py-2.5 rounded-xl text-white font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
                style={{ backgroundColor: theme.accent_primary }}
              >
                <Check className="w-3.5 h-3.5" />
                Accetta Tutti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Granular Cookie Preferences Modal */}
      {isCookieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-white max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Centro Preferenze Cookie</h2>
                  <p className="text-xs text-slate-400">Configura il livello di consenso per ciascuna categoria</p>
                </div>
              </div>

              <button
                onClick={() => setIsCookieModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category 1: Strictly Necessary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">Cookie Tecnici & Necessari</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                  Sempre Attivi (Obbligatori)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Questi cookie sono essenziali per il corretto funzionamento dell'applicazione. Consentono l'accesso sicuro all'area riservata, la memorizzazione dello stato della sessione utente, la protezione anti-CSRF e la gestione del rate limiting per prevenire intrusioni. Non memorizzano informazioni personali identificabili non pertinenti al coaching.
              </p>
            </div>

            {/* Category 2: Functional & Preferences */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Cookie di Funzionalità & Preferenze</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefFunctional}
                    onChange={(e) => setPrefFunctional(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Permettono alla piattaforma di ricordare le impostazioni dell'atleta e del coach, tra cui il tema visivo personalizzato, la visualizzazione preferita delle tabelle (desktop vs mobile card) e la persistenza locale delle preferenze dell'interfaccia.
              </p>
            </div>

            {/* Category 3: Telemetry & Analytics */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Telemetria Prestazionale & Analitica (Anonimizzata)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefAnalytics}
                    onChange={(e) => setPrefAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Raccoglie metriche aggregate e completamente anonime sui tempi di caricamento, sulla latenza di decodifica dei file binari Garmin .FIT via USB e sulla stabilità del browser, senza tracciamento di profilazione pubblicitaria né cessione a terze parti.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <button
                onClick={handleRejectNonNecessary}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                Rifiuta Tutti (Solo Tecnici)
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
                >
                  Salva Preferenze
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-white font-bold shadow-md hover:opacity-95 transition-all"
                  style={{ backgroundColor: theme.accent_primary }}
                >
                  Accetta Tutti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
