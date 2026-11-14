/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Footprints,
  Sun,
  Moon,
  BookOpen,
  CheckCircle2,
  X,
  Play,
  Mail,
} from 'lucide-react';

export const EngagementHubModals: React.FC = () => {
  const {
    currentUser,
    latestCelebrationRecord,
    dismissCelebrationRecord,
    stepStreak,
    dripModules,
    completeDripModule,
    isEndOfDayModalOpen,
    setIsEndOfDayModalOpen,
    isMorningBriefingOpen,
    setIsMorningBriefingOpen,
    isDripModalOpen,
    setIsDripModalOpen,
    locale,
  } = useApp();

  // End-of-day checklist local states
  const [eodStepsDone, setEodStepsDone] = useState(false);
  const [eodMacrosDone, setEodMacrosDone] = useState(true);
  const [eodHabitsDone, setEodHabitsDone] = useState(true);
  const [eodBedtimeTarget, setEodBedtimeTarget] = useState('23:15');
  const [eodSaved, setEodSaved] = useState(false);

  return (
    <>
      {/* 1. PR & Volume Record Celebration Modal */}
      {latestCelebrationRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-950 text-white rounded-3xl max-w-md w-full p-6 border border-purple-500/40 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-700 mx-auto flex items-center justify-center">
              <Trophy className="w-7 h-7 text-amber-300" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Nuovo Record Storico Sbloccato
            </div>
            <h3 className="text-xl font-black">
              {latestCelebrationRecord.exercise_name || 'Record Allenamento'}
            </h3>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-3xl font-black font-mono-tabular text-emerald-400">
                {latestCelebrationRecord.value} {latestCelebrationRecord.unit}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Tipo: {latestCelebrationRecord.record_type} · Scope: {latestCelebrationRecord.scope}
              </div>
            </div>
            <button
              type="button"
              onClick={dismissCelebrationRecord}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs cursor-pointer"
            >
              Continua Progressione
            </button>
          </div>
        </div>
      )}

      {/* 2. Morning Email Briefing Preview Modal */}
      {isMorningBriefingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sun className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Briefing Mattutino Automatico (07:30)
                  </div>
                  <h3 className="text-sm font-extrabold">Obiettivi di Oggi · {currentUser.full_name}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMorningBriefingOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Oggetto Email: <strong>[Team Pavone] Focus del Giorno: Upper Push & {stepStreak.daily_target_steps.toLocaleString()} passi</strong></span>
              </div>
              <ul className="space-y-2.5">
                <li className="p-3 rounded-xl bg-purple-50 border border-purple-200 font-semibold text-purple-950">
                  Allenamento Programmato: Giorno A - Upper Push & Deltoidi (target 1 RIR)
                </li>
                <li className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 font-semibold text-indigo-950">
                  Target Passi & Streak: {stepStreak.daily_target_steps.toLocaleString()} passi (Serie attiva: {stepStreak.current_streak_days} giorni consecutivi!)
                </li>
                <li className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-semibold text-emerald-950">
                  Macros & Porzioni: 2.300 kcal · 6 Palmi Proteine · 8 Manciate Carbo · 4 Pollici Grassi
                </li>
              </ul>
              <button
                type="button"
                onClick={() => setIsMorningBriefingOpen(false)}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
              >
                Ricevuto, pronti per oggi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. End-of-Day Checklist Modal */}
      {isEndOfDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Moon className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Chiusura Giornata · 21:00
                  </div>
                  <h3 className="text-sm font-extrabold">Checklist Serale & Orario Sonno</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEndOfDayModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer min-h-[44px]">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-indigo-600" />
                  Completati {stepStreak.daily_target_steps.toLocaleString()} passi ({stepStreak.today_steps.toLocaleString()} attuali)
                </span>
                <input
                  type="checkbox"
                  checked={eodStepsDone}
                  onChange={(e) => setEodStepsDone(e.target.checked)}
                  className="w-4 h-4 accent-purple-700"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer min-h-[44px]">
                <span className="font-bold text-slate-800">Calorie & Macros / Porzioni registrati</span>
                <input
                  type="checkbox"
                  checked={eodMacrosDone}
                  onChange={(e) => setEodMacrosDone(e.target.checked)}
                  className="w-4 h-4 accent-purple-700"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer min-h-[44px]">
                <span className="font-bold text-slate-800">Abitudini quotidiane spuntate</span>
                <input
                  type="checkbox"
                  checked={eodHabitsDone}
                  onChange={(e) => setEodHabitsDone(e.target.checked)}
                  className="w-4 h-4 accent-purple-700"
                />
              </label>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="font-bold text-slate-800">Orario target a letto:</span>
                <input
                  type="time"
                  value={eodBedtimeTarget}
                  onChange={(e) => setEodBedtimeTarget(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono-tabular font-bold"
                />
              </div>

              {eodSaved && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                  Checklist serale salvata. Ottimo recupero notturno!
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setEodSaved(true);
                  setTimeout(() => {
                    setEodSaved(false);
                    setIsEndOfDayModalOpen(false);
                  }, 1100);
                }}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold cursor-pointer"
              >
                Conferma Chiusura Giornata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Scheduled Educational Drip / Video Courses Modal */}
      {isDripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Percorso Educativo Programmato (Drip)
                  </div>
                  <h3 className="text-sm font-extrabold">Mini-Corsi Video: Fat Loss, Meal Prep, Sonno & Ormoni</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDripModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              {dripModules.map((mod) => {
                const isDone = mod.completed_by_athlete_ids.includes(currentUser.id);
                const title = locale === 'en' ? mod.title_en : mod.title_it;
                const summary = locale === 'en' ? mod.summary_en : mod.summary_it;
                return (
                  <div
                    key={mod.id}
                    className={`p-4 rounded-2xl border ${
                      isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 font-mono-tabular">
                        Giorno +{mod.day_offset} · {mod.category} · {mod.duration_min} min
                      </span>
                      {isDone ? (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completato
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => completeDripModule(mod.id)}
                          className="px-3 py-1 rounded-lg bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" /> Segna come Visto
                        </button>
                      )}
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">{title}</h4>
                    <p className="text-slate-600 leading-relaxed">{summary}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
