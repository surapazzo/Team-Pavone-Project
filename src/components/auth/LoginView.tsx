/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { checkLoginRateLimit, recordFailedLogin, resetLoginAttempts } from '../../services/securityAndGdpr';
import {
  Lock,
  Mail,
  ShieldAlert,
  CheckCircle2,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Cookie,
  AlertTriangle,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    switchUserRole,
    setCurrentRoute,
    acceptGdprConsent,
    loginWithGoogle,
    setIsCookieModalOpen,
    theme,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('luca.puci@gmail.com');
  const [password, setPassword] = useState('password123');
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Google Modal Simulation State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGdprConsent, setRegGdprConsent] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const clientIp = '127.0.0.1';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimitError(null);

    // Rate Limiter Check (TC-SEC-04)
    const limitCheck = checkLoginRateLimit(clientIp);
    if (!limitCheck.allowed) {
      setRateLimitError(
        `Troppi tentativi falliti. Bloccato per ancora ${limitCheck.waitSeconds}s per prevenire attacchi brute-force.`
      );
      return;
    }

    if (email.toLowerCase().includes('pavone') || email.toLowerCase().includes('coach')) {
      resetLoginAttempts(clientIp);
      switchUserRole('COACH');
      setCurrentRoute('/app/dashboard');
    } else if (email) {
      resetLoginAttempts(clientIp);
      switchUserRole('ATHLETE');
      setCurrentRoute('/app/dashboard');
    } else {
      const record = recordFailedLogin(clientIp);
      if (record.locked) {
        setRateLimitError('Rate limiter attivato: 5 tentativi consecutivi falliti. Accesso bloccato per 60 secondi.');
      } else {
        setAttemptsRemaining(record.attemptsLeft);
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // TC-GDPR-01: Blocco registrazione se manca consenso Art. 9
    if (!regGdprConsent) {
      setRegError(
        'È obbligatorio accettare il trattamento dei dati particolari e biometrici (Art. 9 GDPR) per registrarsi nel programma.'
      );
      return;
    }

    acceptGdprConsent('athlete-new');
    switchUserRole('ATHLETE');
    setCurrentRoute('/app/dashboard');
  };

  const handleQuickLoginAs = (role: 'COACH' | 'ATHLETE', userEmail: string) => {
    setEmail(userEmail);
    resetLoginAttempts(clientIp);
    switchUserRole(role);
    setCurrentRoute('/app/dashboard');
  };

  const handleTriggerSimulatedGoogleLogin = (chosenEmail: string, chosenName: string) => {
    resetLoginAttempts(clientIp);
    loginWithGoogle({
      email: chosenEmail,
      name: chosenName,
    });
    setIsGoogleModalOpen(false);
  };

  const handleSimulateBruteForce = () => {
    for (let i = 0; i < 5; i++) {
      recordFailedLogin(clientIp);
    }
    const check = checkLoginRateLimit(clientIp);
    if (!check.allowed) {
      setRateLimitError(`Rate limiter attivato: 5 tentativi falliti consecutivi. IP bloccato per ${check.waitSeconds}s.`);
    }
  };

  const handleResetRateLimit = () => {
    resetLoginAttempts(clientIp);
    setRateLimitError(null);
    setAttemptsRemaining(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-white relative">
        {/* Brand Lockup */}
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center mx-auto mb-3 shadow-md"
            style={{ backgroundColor: theme.accent_primary }}
          >
            TP
          </div>
          <h1 className="text-xl font-black text-white">Area Riservata Polimorfica</h1>
          <p className="text-xs text-slate-400 mt-1">
            Accesso sicuro per Atleti e Staff Tecnico Team Pavone
          </p>
        </div>

        {/* 1-Click Quick Testing Console for Instant Verification */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Test Rapido Credenziali
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1 Clic</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLoginAs('ATHLETE', 'luca.puci@gmail.com')}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold rounded-xl border border-purple-800/60 flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              Atleta (Luca)
            </button>
            <button
              onClick={() => handleQuickLoginAs('COACH', 'coach@teampavone.it')}
              className="px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Coach (Pavone)
            </button>
          </div>
        </div>

        {/* Google Sign-In Button (RICHIESTA UTENTE ESPLICITA) */}
        <div>
          <button
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-3 border border-slate-300"
          >
            {/* Official Google G Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Entra con Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-semibold">oppure accedi con email</span>
            </div>
          </div>
        </div>

        {/* Tab switch between Login & Register */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('LOGIN')}
            className={`py-2 rounded-lg transition-colors ${
              activeTab === 'LOGIN' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Accedi
          </button>
          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`py-2 rounded-lg transition-colors ${
              activeTab === 'REGISTER' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Nuovo Atleta
          </button>
        </div>

        {rateLimitError && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{rateLimitError}</span>
            </div>
            <button
              onClick={handleResetRateLimit}
              className="text-[10px] underline hover:text-white whitespace-nowrap"
            >
              Sblocca
            </button>
          </div>
        )}

        {regError && (
          <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{regError}</span>
          </div>
        )}

        {/* Form */}
        {activeTab === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="luca.puci@gmail.com o coach@teampavone.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {attemptsRemaining !== null && (
              <div className="text-[11px] text-amber-400 font-semibold">
                Tentativi prima del blocco IP: {attemptsRemaining}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              style={{ backgroundColor: theme.accent_primary }}
            >
              Accedi all'Area Riservata <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Test Rate Limiter Action */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleSimulateBruteForce}
                className="text-[10px] text-slate-500 hover:text-slate-300 underline"
              >
                Simula 5 tentativi errati (Test Sicurezza Rate Limiting TC-SEC-04)
              </button>
            </div>
          </form>
        ) : (
          /* Register Form with mandatory GDPR Art. 9 consent */
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nome e Cognome *</label>
              <input
                type="text"
                required
                placeholder="Mario Rossi"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="mario@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* GDPR Art. 9 Consent Checkbox (TC-GDPR-01) */}
            <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/80">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regGdprConsent}
                  onChange={(e) => setRegGdprConsent(e.target.checked)}
                  className="mt-0.5 rounded accent-purple-600"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  Presto il <strong>consenso esplicito (Art. 9 GDPR)</strong> al trattamento dei miei dati relativi alla salute, composizione corporea, telemetria Garmin e fotografie per le finalità esclusive del coaching.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              style={{ backgroundColor: theme.accent_primary }}
            >
              <ShieldCheck className="w-4 h-4" /> Registrati ed Entra
            </button>
          </form>
        )}

        {/* Cookie Quick Preferences Link */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <button
            onClick={() => setIsCookieModalOpen(true)}
            className="hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <Cookie className="w-3.5 h-3.5 text-purple-400" />
            <span>Gestione Cookie & Privacy</span>
          </button>
          <button
            onClick={() => setCurrentRoute('/')}
            className="hover:text-slate-300 transition-colors"
          >
            ← Torna al sito pubblico
          </button>
        </div>
      </div>

      {/* Google Account Picker Simulation Dialog */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-base text-slate-900">Accedi con Google</h3>
              <p className="text-xs text-slate-500">
                per continuare su <strong>Team Pavone Coaching</strong>
              </p>
            </div>

            <div className="divide-y divide-slate-100 border-y border-slate-100 text-xs">
              {/* Account 1: User's session account */}
              <button
                onClick={() => handleTriggerSimulatedGoogleLogin('surapazzo@gmail.com', 'Utente Google (surapazzo)')}
                className="w-full py-3 px-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-xs">
                  S
                </div>
                <div>
                  <div className="font-bold text-slate-900">surapazzo@gmail.com</div>
                  <div className="text-[10px] text-slate-400">Account Google attivo</div>
                </div>
              </button>

              {/* Account 2: Atleta Luca Puci */}
              <button
                onClick={() => handleTriggerSimulatedGoogleLogin('luca.puci@gmail.com', 'Luca Puci')}
                className="w-full py-3 px-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  L
                </div>
                <div>
                  <div className="font-bold text-slate-900">Luca Puci</div>
                  <div className="text-[10px] text-slate-400">luca.puci@gmail.com</div>
                </div>
              </button>

              {/* Account 3: Coach Francesco Pavone */}
              <button
                onClick={() => handleTriggerSimulatedGoogleLogin('francesco.pavone@gmail.com', 'Francesco Pavone')}
                className="w-full py-3 px-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-purple-900 text-white font-bold flex items-center justify-center text-xs">
                  FP
                </div>
                <div>
                  <div className="font-bold text-slate-900">Francesco Pavone (Coach)</div>
                  <div className="text-[10px] text-slate-400">francesco.pavone@gmail.com</div>
                </div>
              </button>
            </div>

            {/* Custom Google account input */}
            <div className="space-y-2 pt-1 text-xs">
              <span className="text-[11px] text-slate-500 font-semibold block">Oppure usa un altro account Google:</span>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="latuaemail@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  onClick={() => customGoogleEmail && handleTriggerSimulatedGoogleLogin(customGoogleEmail, customGoogleEmail.split('@')[0])}
                  disabled={!customGoogleEmail}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-lg text-xs"
                >
                  Entra
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsGoogleModalOpen(false)}
              className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
