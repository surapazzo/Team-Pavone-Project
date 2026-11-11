/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { checkLoginRateLimit, recordFailedLogin, resetLoginAttempts } from '../../services/securityAndGdpr';
import { Lock, Mail, ShieldAlert, CheckCircle2, User, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { switchUserRole, setCurrentRoute, theme } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const clientIp = '127.0.0.1';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimitError(null);

    // Rate Limiter Check (TC-SEC-04)
    const limitCheck = checkLoginRateLimit(clientIp);
    if (!limitCheck.allowed) {
      setRateLimitError(`Troppi tentativi falliti. Indirizzo bloccato dal Rate Limiter per ancora ${limitCheck.waitSeconds}s per prevenire attacchi brute-force.`);
      return;
    }

    // Role resolution based on email or credentials
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
        setRateLimitError('Rate limiter attivato: 5 tentativi errati consecutivi. Accesso bloccato per 60 secondi.');
      } else {
        setAttemptsRemaining(record.attemptsLeft);
      }
    }
  };

  const handleQuickLoginAs = (role: 'COACH' | 'ATHLETE') => {
    resetLoginAttempts(clientIp);
    switchUserRole(role);
    setCurrentRoute('/app/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="bg-white rounded-2xl border border-purple-200/80 shadow-lg max-w-md w-full p-8 space-y-6">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-3 shadow-sm"
            style={{ backgroundColor: theme.accent_primary }}
          >
            TP
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Area Riservata Polimorfica</h1>
          <p className="text-xs text-slate-500 mt-1">
            Accesso sicuro per Atleti e Staff Tecnico di Francesco Pavone
          </p>
        </div>

        {rateLimitError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{rateLimitError}</span>
          </div>
        )}

        {/* Quick Demo Access Buttons */}
        <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block">
            Accesso Rapido Persona (Single-UI Role-Based)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLoginAs('ATHLETE')}
              className="px-3 py-2 bg-white text-purple-900 font-bold rounded-lg border border-purple-200 hover:bg-purple-100/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-purple-700" />
              Atleta (Luca)
            </button>
            <button
              onClick={() => handleQuickLoginAs('COACH')}
              className="px-3 py-2 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              Coach (Pavone)
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="nome@teampavone.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {attemptsRemaining !== null && (
            <div className="text-[11px] text-amber-700 font-semibold">
              Tentativi rimanenti prima del blocco IP: {attemptsRemaining}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-white font-bold text-xs shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
            style={{ backgroundColor: theme.accent_primary }}
          >
            Accedi con Credenziali <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Social OAuth2 buttons */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="text-center text-[11px] text-slate-400 font-medium">
            oppure accedi tramite OAuth2 protetto
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => handleQuickLoginAs('ATHLETE')}
              className="py-2 px-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Google (Gmail)</span>
            </button>
            <button
              onClick={() => handleQuickLoginAs('ATHLETE')}
              className="py-2 px-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Meta OAuth</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
