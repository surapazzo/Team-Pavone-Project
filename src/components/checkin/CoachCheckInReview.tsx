/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WeeklyCheckIn } from '../../types';
import {
  CheckSquare,
  MessageSquare,
  Camera,
  Play,
  Settings,
  Send,
  CheckCircle2,
  Sliders,
  ChevronDown,
} from 'lucide-react';

export const CoachCheckInReview: React.FC = () => {
  const {
    athletes,
    selectedAthleteId,
    setSelectedAthleteId,
    weeklyCheckins,
    reviewCheckin,
    theme,
  } = useApp();

  const athleteCheckins = weeklyCheckins
    .filter((c) => c.athlete_id === selectedAthleteId)
    .sort((a, b) => b.submission_date.localeCompare(a.submission_date));

  const [selectedCheckinId, setSelectedCheckinId] = useState<string>(() => athleteCheckins[0]?.id || '');
  const activeCheckin = athleteCheckins.find((c) => c.id === selectedCheckinId) || athleteCheckins[0];

  // Previous week checkin for side-by-side comparison
  const previousCheckin = athleteCheckins.length > 1 ? athleteCheckins[1] : null;

  // Feedback form state
  const [coachFeedbackText, setCoachFeedbackText] = useState(() => activeCheckin?.coach_feedback || '');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // Survey Customizer Tab
  const [activeTab, setActiveTab] = useState<'REVIEW' | 'CUSTOMIZE_SURVEY'>('REVIEW');
  const [customQuestions, setCustomQuestions] = useState([
    { id: 'q1', text: 'Stai eseguendo la serie di riscaldamento specifica per le spalle?', active: true },
    { id: 'q2', text: 'Hai notato ritenzione idrica tibiale al risveglio?', active: true },
    { id: 'q3', text: 'Hai consumato la dose di sale marino integrale pre-workout?', active: true },
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckin || !coachFeedbackText) return;
    reviewCheckin(activeCheckin.id, coachFeedbackText);
    setFeedbackSaved(true);
    setTimeout(() => setFeedbackSaved(false), 3000);
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText) return;
    setCustomQuestions((prev) => [
      ...prev,
      { id: `q-${Date.now()}`, text: newQuestionText, active: true },
    ]);
    setNewQuestionText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
            Console Head Coach
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Check-In Review & Survey Customizer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analisi comparativa settimana su settimana, galleria foto progresso side-by-side e feedback 1-on-1
          </p>
        </div>

        {/* Tab switch between Review and Survey Customizer */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('REVIEW')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'REVIEW' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revisione Check-In
          </button>
          <button
            onClick={() => setActiveTab('CUSTOMIZE_SURVEY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'CUSTOMIZE_SURVEY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Personalizza Survey
          </button>
        </div>
      </div>

      {activeTab === 'CUSTOMIZE_SURVEY' ? (
        /* SURVEY CUSTOMIZER PANEL */
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Personalizzazione Domande Survey (Coach)</h2>
              <p className="text-xs text-slate-500">
                Aggiungi o attiva/disattiva domande specifiche per il protocollo di Francesco Pavone
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {customQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4 text-xs"
              >
                <span className={`font-semibold ${q.active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                  {q.text}
                </span>
                <button
                  onClick={() =>
                    setCustomQuestions((prev) =>
                      prev.map((item) => (item.id === q.id ? { ...item, active: !item.active } : item))
                    )
                  }
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    q.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {q.active ? 'Attiva' : 'Disattivata'}
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddCustomQuestion} className="flex gap-2 pt-4 border-t border-slate-100">
            <input
              type="text"
              placeholder="Aggiungi nuova domanda personalizzata per gli atleti..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm"
              style={{ backgroundColor: theme.accent_primary }}
            >
              Aggiungi alla Survey
            </button>
          </form>
        </div>
      ) : (
        /* CHECK-IN REVIEW & COMPARISON */
        <div className="space-y-8">
          {/* Athlete & Checkin Selectors */}
          <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
            <div>
              <span className="text-slate-500 font-semibold mr-2">Seleziona Atleta:</span>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="px-3 py-1.5 font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg"
              >
                {athletes.map((ath) => (
                  <option key={ath.id} value={ath.id}>
                    {ath.full_name} ({ath.email})
                  </option>
                ))}
              </select>
            </div>

            {athleteCheckins.length > 0 && (
              <div>
                <span className="text-slate-500 font-semibold mr-2">Settimana Check-In:</span>
                <select
                  value={selectedCheckinId}
                  onChange={(e) => {
                    setSelectedCheckinId(e.target.value);
                    const found = athleteCheckins.find((c) => c.id === e.target.value);
                    if (found) setCoachFeedbackText(found.coach_feedback || '');
                  }}
                  className="px-3 py-1.5 font-bold text-purple-900 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  {athleteCheckins.map((chk) => (
                    <option key={chk.id} value={chk.id}>
                      {chk.iso_week} ({chk.review_status}) · Voto {chk.weekly_rating}/10
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeCheckin ? (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Left 2 Cols: Side-by-side answers & Photos */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Side-by-Side Progress Photos Gallery */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-purple-700" />
                      <h2 className="text-sm font-bold text-slate-900">
                        Galleria Foto Progresso ({activeCheckin.iso_week})
                      </h2>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Stripping EXIF completato · Storage Privato Protetto
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {activeCheckin.photos_uploaded.map((p) => (
                      <div key={p.view} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <div className="h-56 bg-slate-200">
                          <img
                            src={p.url}
                            alt={p.view}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-2 text-center text-xs font-bold text-slate-700 capitalize">
                          {p.caption || `Vista ${p.view}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Side-by-Side Answers Comparison */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Risposte Atleta · 7 Aree del Check-In
                  </h2>

                  <div className="space-y-4 text-xs divide-y divide-slate-100">
                    <div className="pt-2">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Voto Settimana & Highlights
                      </span>
                      <div className="text-slate-900 font-bold text-sm mt-0.5">
                        Valutazione: {activeCheckin.weekly_rating}/10
                      </div>
                      <p className="text-slate-700 mt-1 italic">"{activeCheckin.highlights}"</p>
                      <div className="text-slate-500 mt-1">
                        <strong>Da migliorare:</strong> {activeCheckin.improvement_areas || 'Nessun punto critico'}
                      </div>
                    </div>

                    <div className="pt-3">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Allenamento & Energia
                      </span>
                      <div className="text-slate-800 mt-0.5">
                        Energia: <strong>{activeCheckin.training_energy}</strong> · Fascia: {activeCheckin.training_time_slot} ({activeCheckin.training_exact_time || 'N/D'})
                      </div>
                      <div className="text-slate-600 mt-1">
                        <strong>Esercizi con fastidi:</strong> {activeCheckin.exercises_needing_work || 'Nessuno'}
                      </div>
                      {activeCheckin.training_questions && (
                        <div className="mt-2 p-2.5 bg-purple-50 rounded-lg text-purple-900">
                          <strong>Domanda per Francesco:</strong> {activeCheckin.training_questions}
                        </div>
                      )}
                    </div>

                    <div className="pt-3">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Nutrizione & Aderenza Macros
                      </span>
                      <div className="text-slate-800 mt-0.5">
                        Raggiunti ogni giorno: <strong>{activeCheckin.hit_macros_daily}</strong> · Precisione pesata: {activeCheckin.measurement_precision}/10
                      </div>
                      <div className="text-slate-600 mt-1">
                        <strong>Fame durante il giorno:</strong> {activeCheckin.daytime_hunger || 'Nessuna'}
                      </div>
                    </div>

                    <div className="pt-3">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Sonno & Digestione
                      </span>
                      <div className="text-slate-800 mt-0.5">
                        Addormentamento: {activeCheckin.sleep_trouble} · Orario medio a letto: {activeCheckin.avg_bedtime}
                      </div>
                      <div className="text-slate-600 mt-1">
                        Gonfiore/Digestione: <strong>{activeCheckin.digestive_issues}</strong> {activeCheckin.suspected_foods && `(${activeCheckin.suspected_foods})`}
                      </div>
                    </div>

                    <div className="pt-3">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        "Il Tuo Spazio" (Diario Aperto Atleta)
                      </span>
                      <p className="text-slate-700 italic mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        "{activeCheckin.free_thoughts_space || 'Nessuna nota aggiuntiva condivisa.'}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Video Review & Coach Feedback Editor */}
              <div className="space-y-6">
                {/* Exercise Video Review Player */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Play className="w-4 h-4 text-purple-700" />
                    <h2 className="text-sm font-bold text-slate-900">Revisione Video Esercizi</h2>
                  </div>

                  {activeCheckin.execution_videos && activeCheckin.execution_videos.length > 0 ? (
                    <div className="space-y-3">
                      {activeCheckin.execution_videos.map((vid, idx) => (
                        <div key={idx} className="space-y-2">
                          <span className="text-xs font-bold text-slate-800">{vid.exercise_name}</span>
                          <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                            <iframe
                              src={vid.video_url}
                              title={vid.exercise_name}
                              className="absolute inset-0 w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
                      Nessun video di esecuzione allegato a questo check-in.
                    </div>
                  )}
                </div>

                {/* Feedback Box & Status Update */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-700" />
                      <h2 className="text-sm font-bold text-slate-900">Feedback di Francesco Pavone</h2>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      activeCheckin.review_status === 'REVIEWED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {activeCheckin.review_status}
                    </span>
                  </div>

                  {feedbackSaved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Feedback salvato e inviato all'atleta! Status impostato su REVIEWED.</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveFeedback} className="space-y-3 text-xs">
                    <label className="block text-slate-600 font-semibold">
                      Note tecniche, aggiustamento calorie/macrociclo e risposta alle domande:
                    </label>
                    <textarea
                      rows={6}
                      value={coachFeedbackText}
                      onChange={(e) => setCoachFeedbackText(e.target.value)}
                      placeholder="Scrivi qui il feedback per l'atleta..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />

                    <button
                      type="submit"
                      className="w-full py-2.5 font-bold text-white rounded-lg shadow-sm flex items-center justify-center gap-2"
                      style={{ backgroundColor: theme.accent_primary }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Approva Check-In & Invia Feedback
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              Nessun check-in trovato per questo atleta.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
