/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  CheckSquare,
  Video,
  CreditCard,
  Calendar,
  ArrowRight,
  PhoneCall,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { CoachTrainingAnalytics } from './CoachTrainingAnalytics';

export const CoachDashboard: React.FC = () => {
  const {
    athletes,
    selectedAthleteId,
    setSelectedAthleteId,
    selectedAthlete,
    dailyLogs,
    weeklyCheckins,
    stripeData,
    setCurrentRoute,
    onboardingApplications,
    inviteToDiscoveryCall,
    approveVipApplication,
    qaThreads,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [callLinks, setCallLinks] = useState<Record<string, string>>({});

  const filteredAthletes = athletes.filter((a) =>
    a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selected athlete metrics
  const athleteLogs = dailyLogs
    .filter((l) => l.athlete_id === selectedAthleteId)
    .sort((a, b) => a.log_date.localeCompare(b.log_date));

  const pendingCheckinsCount = weeklyCheckins.filter((c) => c.review_status === 'PENDING').length;
  const unansweredQaCount = qaThreads.filter((th) => !th.replies.some((r) => r.is_official_coach_reply)).length;

  // Chart data for selected athlete
  const chartData = athleteLogs.map((log, index) => {
    const slice = athleteLogs.slice(Math.max(0, index - 6), index + 1);
    const validW = slice.filter((s) => s.weight_kg > 0).map((s) => s.weight_kg);
    const movingAvg = validW.length > 0 ? Number((validW.reduce((a, b) => a + b, 0) / validW.length).toFixed(2)) : null;

    return {
      date: log.log_date.slice(5),
      weight: log.weight_kg > 0 ? log.weight_kg : null,
      movingAvg,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Top Bar: Athlete Switcher & Coach Command Center */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Console Head Coach
          </div>
          <h1 className="text-2xl font-black">
            Panoramica CX & Gestione Team Pavone
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisione atleti, analytics allenamento & DOMS, bacheca Q&A e coda ammissioni VIP
          </p>
        </div>

        {/* Quick Search Athlete */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cerca atleta nel roster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* 2. Top Metric Cards: Team Adherence, Pending Checkins & Stripe MRR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Atleti Attivi nel Roster</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-tabular">
            {athletes.length} <span className="text-xs font-normal text-slate-500">atleti</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            100% capienza mesociclo attiva
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Check-In da Revisionare</span>
            <CheckSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-tabular">
            {pendingCheckinsCount} <span className="text-xs font-normal text-slate-500">in attesa</span>
          </div>
          <button
            onClick={() => setCurrentRoute('/app/check-in')}
            className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold mt-1 flex items-center gap-1"
          >
            Apri pannello revisione <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Video Esecuzione Esercizi</span>
            <Video className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-tabular">
            2 <span className="text-xs font-normal text-slate-500">clip caricate</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Focus: ROM Squat e panca manubri
          </div>
        </div>

        {/* Stripe MRR Widget */}
        <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-200">Stripe MRR (Ricavo Mensile)</span>
            <CreditCard className="w-4 h-4 text-purple-300" />
          </div>
          <div className="text-2xl font-black font-mono-tabular">
            €{stripeData.mrr_eur.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-200 mt-1 flex items-center gap-2">
            <span>{stripeData.active_subscribers} abbonati</span>
            <span>·</span>
            <span className="text-amber-300">{stripeData.expiring_this_week} in scadenza</span>
          </div>
        </div>
      </div>

      {/* 3. Team Roster Grid with Adherence Traffic Lights */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Roster Atleti & Semaforo Aderenza</h2>
            <p className="text-xs text-slate-500">
              Clicca su un atleta per visualizzare gli analytics di allenamento, DOMS e il macrociclo dedicato
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filteredAthletes.length} atleti filtrati
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAthletes.map((ath) => {
            const isSelected = ath.id === selectedAthleteId;
            const athLogs = dailyLogs.filter((l) => l.athlete_id === ath.id);
            const athCheckins = weeklyCheckins.filter((c) => c.athlete_id === ath.id);
            const latestCheckin = athCheckins[0];

            // Adherence heuristic
            const completedLogs = athLogs.length;
            const adherenceStatus = completedLogs >= 5 ? 'OPTIMAL' : completedLogs >= 3 ? 'WARNING' : 'DANGER';

            return (
              <div
                key={ath.id}
                onClick={() => setSelectedAthleteId(ath.id)}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors ${
                  isSelected ? 'bg-purple-50/70 ring-1 ring-inset ring-purple-300' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {ath.full_name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{ath.full_name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-700 text-white">
                          Selezionato
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {ath.email} · Iniziale: {ath.initial_weight_kg}kg → Target: {ath.target_weight_kg}kg
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs">
                  {/* Semaforo Aderenza */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Aderenza Settimanale</span>
                    <span className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded text-xs ${
                      adherenceStatus === 'OPTIMAL'
                        ? 'bg-emerald-50 text-emerald-800'
                        : adherenceStatus === 'WARNING'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-red-50 text-red-800'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        adherenceStatus === 'OPTIMAL' ? 'bg-emerald-600' : adherenceStatus === 'WARNING' ? 'bg-amber-500' : 'bg-red-600'
                      }`} />
                      {adherenceStatus === 'OPTIMAL' ? 'Alta (100%)' : adherenceStatus === 'WARNING' ? 'Media (60%)' : 'Bassa (<40%)'}
                    </span>
                  </div>

                  {/* Voto Settimana */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Media Voto Settimana</span>
                    <span className="font-mono-tabular font-bold text-slate-900">
                      {latestCheckin ? `${latestCheckin.weekly_rating}/10` : 'N/D'}
                    </span>
                  </div>

                  {/* Check-In Status */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Ultimo Check-In</span>
                    {latestCheckin ? (
                      <span className={`font-semibold ${
                        latestCheckin.review_status === 'PENDING' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {latestCheckin.review_status === 'PENDING' ? 'In Attesa' : 'Revisionato'}
                      </span>
                    ) : (
                      <span className="text-slate-400">Non inviato</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Drill-Down: Atleta Selezionato & Telemetria Garmin */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Focus Drill-Down Atleta
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {selectedAthlete.full_name} · Analisi Dati Oggettivi
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentRoute('/app/community')}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Q&A Da Rispondere ({unansweredQaCount})
            </button>
            <button
              onClick={() => setCurrentRoute('/app/calendar')}
              className="px-3 py-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" /> Modifica Macrociclo
            </button>
            <button
              onClick={() => setCurrentRoute('/app/check-in')}
              className="px-3 py-1.5 bg-purple-700 text-white hover:bg-purple-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Revisiona Check-In
            </button>
          </div>
        </div>

        {/* Module 1: Advanced Training & DOMS Analytics Dashboard */}
        <CoachTrainingAnalytics />

        {/* Weight Trend Chart */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Andamento Peso e Media Mobile 7gg ({selectedAthlete.full_name})
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Line type="monotone" dataKey="weight" stroke="#cbd5e1" strokeWidth={1.5} dot={{ r: 3, fill: '#94a3b8' }} name="Peso Singolo (kg)" />
                <Line type="monotone" dataKey="movingAvg" stroke="#6d28d9" strokeWidth={3} dot={false} name="Media 7gg (kg)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Module 7: Qualifying Onboarding Funnel & VIP Approval Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Coda Qualificazione Onboarding & Tier (Entry vs VIP)
            </h2>
            <p className="text-xs text-slate-500">
              Gestisci gli accessi Entry-Level Stripe automatici e approva le candidature VIP dopo la Discovery Call.
            </p>
          </div>
          <span className="text-xs font-mono-tabular font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
            {onboardingApplications.length} Candidature
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {onboardingApplications.map((app) => (
            <div key={app.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">{app.applicant_name}</span>
                  <span className="text-xs text-slate-500">({app.applicant_email})</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    app.selected_tier === 'TIER_2_VIP'
                      ? 'bg-purple-50 text-purple-900 border-purple-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    {app.selected_tier === 'TIER_2_VIP' ? 'Tier 2 · VIP Coaching' : 'Tier 1 · Entry (€19/m)'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    app.status === 'TIER_2_APPROVED' || app.status === 'TIER_1_ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800'
                      : app.status === 'DISCOVERY_CALL_INVITED'
                      ? 'bg-blue-50 text-blue-800'
                      : 'bg-amber-50 text-amber-800'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Obiettivo:</strong> {app.primary_goal} · <strong>Esperienza:</strong> {app.training_experience} ·{' '}
                  <strong>Impegno:</strong> <span className="font-mono-tabular">{app.commitment_score}/10</span> ({app.weekly_availability_days}gg/sett)
                </p>
                {app.injuries_or_notes && (
                  <p className="text-[11px] text-slate-500">Note: {app.injuries_or_notes}</p>
                )}
              </div>

              {app.selected_tier === 'TIER_2_VIP' && app.status !== 'TIER_2_APPROVED' && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {app.status === 'PENDING_COACH_REVIEW' && (
                    <>
                      <input
                        type="url"
                        placeholder="https://calendly.com/teampavone/discovery"
                        value={callLinks[app.id] || ''}
                        onChange={(e) => setCallLinks({ ...callLinks, [app.id]: e.target.value })}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs w-56"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          inviteToDiscoveryCall(
                            app.id,
                            callLinks[app.id] || 'https://calendly.com/teampavone/discovery-call'
                          )
                        }
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Invita a Discovery Call
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => approveVipApplication(app.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Approva VIP Coaching
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
