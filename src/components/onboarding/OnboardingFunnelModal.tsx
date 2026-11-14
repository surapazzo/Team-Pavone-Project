/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubscriptionTier } from '../../types';
import { ShieldCheck, CheckCircle2, CreditCard, PhoneCall, X, Sparkles } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export const OnboardingFunnelModal: React.FC = () => {
  const {
    currentUser,
    isOnboardingModalOpen,
    setIsOnboardingModalOpen,
    submitOnboardingApplication,
    setCurrentRoute,
  } = useApp();
  const { t } = useTranslation();

  const [tier, setTier] = useState<SubscriptionTier>('TIER_1_ENTRY');
  const [name, setName] = useState(currentUser.full_name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [goal, setGoal] = useState('Ricomposizione corporea & forza');
  const [experience, setExperience] = useState('1-3 anni in palestra');
  const [days, setDays] = useState(4);
  const [notes, setNotes] = useState('');
  const [commitment, setCommitment] = useState(9);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  if (!isOnboardingModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = submitOnboardingApplication({
      applicant_name: name,
      applicant_email: email,
      selected_tier: tier,
      primary_goal: goal,
      training_experience: experience,
      weekly_availability_days: days,
      injuries_or_notes: notes,
      commitment_score: commitment,
    });
    setSubmittedStatus(result.status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Modulo 7 · Accesso & Qualificazione Obbligatoria
            </div>
            <h3 className="text-base font-extrabold">{t('onboarding.title')}</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmittedStatus(null);
              setIsOnboardingModalOpen(false);
            }}
            className="p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {submittedStatus ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
              {submittedStatus === 'TIER_1_ACTIVE' ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-black text-slate-900">
                    Checkout Stripe Completato · Tier 1 App Attivata!
                  </h4>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Hai sbloccato immediatamente Workout Logger Mobile, Ricettario & Porzioni a Mano, Personal Toolbox e Community Q&A.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedStatus(null);
                      setIsOnboardingModalOpen(false);
                      setCurrentRoute('/app/dashboard');
                    }}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-purple-700 text-white font-extrabold cursor-pointer"
                  >
                    Entra nell'App Entry-Level
                  </button>
                </>
              ) : (
                <>
                  <PhoneCall className="w-12 h-12 text-purple-700 mx-auto" />
                  <h4 className="text-lg font-black text-slate-900">
                    Candidatura VIP Inviata · Status: PENDING_COACH_REVIEW
                  </h4>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Coach Francesco Pavone esaminerà le tue risposte al questionario e ti invierà l'invito alla Discovery Call prima dell'attivazione 1-on-1.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedStatus(null);
                      setIsOnboardingModalOpen(false);
                    }}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold cursor-pointer"
                  >
                    Chiudi
                  </button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tier Selection */}
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTier('TIER_1_ENTRY')}
                  className={`p-4 rounded-2xl border text-left space-y-1.5 cursor-pointer ${
                    tier === 'TIER_1_ENTRY'
                      ? 'border-purple-700 bg-purple-50/70'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{t('onboarding.tier1')}</span>
                    <CreditCard className="w-4 h-4 text-purple-700" />
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Self-service Stripe Checkout → Accesso immediato a Workout Logger, Ricette, Toolbox & Q&A Board.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('TIER_2_VIP')}
                  className={`p-4 rounded-2xl border text-left space-y-1.5 cursor-pointer ${
                    tier === 'TIER_2_VIP'
                      ? 'border-purple-700 bg-purple-50/70'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{t('onboarding.tier2')}</span>
                    <Sparkles className="w-4 h-4 text-purple-700" />
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Revisione Coach → Discovery Call → Approvazione manuale per Macrociclo 1-on-1 & Video Check-In.
                  </p>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Obiettivo Principale *</label>
                <input
                  type="text"
                  required
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Esperienza Allenamento</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Giorni disponibili / settimana</label>
                  <input
                    type="number"
                    min={2}
                    max={7}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono-tabular"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-800 mb-1">
                  <span>Livello di Impegno (1–10)</span>
                  <span className="font-mono-tabular text-purple-700">{commitment}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={commitment}
                  onChange={(e) => setCommitment(Number(e.target.value))}
                  className="w-full h-3 accent-purple-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Infortuni o Note Logistiche</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Eventuali fastidi articolari, attrezzatura disponibile o turni lavorativi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[46px] py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                {tier === 'TIER_1_ENTRY'
                  ? 'Completa Questionario & Procedi a Stripe Checkout (€19/mese)'
                  : 'Invia Candidatura VIP per Revisione Coach'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
