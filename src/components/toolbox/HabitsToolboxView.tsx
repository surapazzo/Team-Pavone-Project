/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PERSONAL_TOOLBOX_RESOURCES } from '../../data/upgradeSeedData';
import { HabitItem } from '../../types';
import {
  CheckSquare,
  Square,
  Sparkles,
  BookOpen,
  Headphones,
  Plus,
  Play,
  Pause,
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export const HabitsToolboxView: React.FC = () => {
  const {
    currentUser,
    selectedAthlete,
    habits,
    habitLogs,
    addHabitItem,
    toggleHabitCompletion,
    saveEveningReflection,
    locale,
    theme,
  } = useApp();
  const { t } = useTranslation();

  const isCoach = currentUser.role === 'COACH';
  const targetAthleteId = isCoach ? selectedAthlete.id : currentUser.id;
  const todayKey = new Date().toISOString().split('T')[0];

  const athleteHabits = habits.filter((h) => h.athlete_id === targetAthleteId || h.athlete_id === 'athlete-luca-puci');
  const todayLog = habitLogs.find((l) => l.athlete_id === targetAthleteId && l.log_date === todayKey) ||
    habitLogs.find((l) => l.log_date === todayKey);

  const completedTodayIds = todayLog?.completed_habit_ids || [];

  // Evening reflection state
  const [energyScore, setEnergyScore] = useState(todayLog?.evening_energy_score || 8);
  const [challengeNote, setChallengeNote] = useState(todayLog?.evening_challenge_note || '');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Add habit form (Coach/Athlete)
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCat, setNewHabitCat] = useState<HabitItem['category']>('MOVEMENT');

  // Toolbox interactive state
  const [selectedResourceId, setSelectedResourceId] = useState<string>(PERSONAL_TOOLBOX_RESOURCES[0].id);
  const [worksheetChecks, setWorksheetChecks] = useState<Record<string, boolean>>({});
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const weeklyProgressPct = useMemo(() => {
    if (athleteHabits.length === 0) return 0;
    return Math.round((completedTodayIds.length / athleteHabits.length) * 100);
  }, [athleteHabits.length, completedTodayIds.length]);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    addHabitItem(newHabitTitle, newHabitTitle, 7, newHabitCat);
    setNewHabitTitle('');
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    saveEveningReflection(energyScore, challengeNote, todayKey);
    setReflectionSaved(true);
    setTimeout(() => setReflectionSaved(false), 2500);
  };

  const activeResource =
    PERSONAL_TOOLBOX_RESOURCES.find((r) => r.id === selectedResourceId) || PERSONAL_TOOLBOX_RESOURCES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-24 lg:pb-10">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
          Modulo 6 · Habit Tracker & Personal Toolbox
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t('toolbox.title')}</h1>
        <p className="text-xs text-slate-500 mt-1">
          Spunta le abitudini quotidiane, registra il bilancio serale ed esplora i 7 protocolli pratici di Francesco Pavone.
        </p>
      </div>

      {/* SECTION 1: DAILY HABIT TRACKER + EVENING REFLECTION */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{t('toolbox.habitsTitle')}</h2>
              <span className="text-xs text-slate-500 font-mono-tabular">
                {completedTodayIds.length}/{athleteHabits.length} completate oggi ({weeklyProgressPct}%)
              </span>
            </div>
            <span className="text-xs font-extrabold font-mono-tabular text-purple-700">{weeklyProgressPct}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-700 transition-all duration-300"
              style={{ width: `${weeklyProgressPct}%` }}
            />
          </div>

          <div className="space-y-2.5">
            {athleteHabits.map((hab) => {
              const checked = completedTodayIds.includes(hab.id);
              const label = locale === 'en' ? hab.title_en : hab.title_it;
              return (
                <button
                  key={hab.id}
                  type="button"
                  onClick={() => toggleHabitCompletion(hab.id, todayKey)}
                  className={`w-full min-h-[48px] p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    checked
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {checked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <div className={`text-xs font-bold ${checked ? 'line-through text-emerald-800' : ''}`}>
                        {label}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono-tabular">
                        {hab.category} · Target {hab.weekly_target_days}gg/sett
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add custom habit */}
          <form onSubmit={handleAddHabit} className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2 text-xs">
            <input
              type="text"
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder="Assegna nuova abitudine quotidiana..."
              className="flex-1 min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
            <select
              value={newHabitCat}
              onChange={(e) => setNewHabitCat(e.target.value as HabitItem['category'])}
              className="min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="MOVEMENT">MOVEMENT</option>
              <option value="HYDRATION">HYDRATION</option>
              <option value="SLEEP">SLEEP</option>
              <option value="NUTRITION">NUTRITION</option>
              <option value="MINDSET">MINDSET</option>
            </select>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Aggiungi
            </button>
          </form>
        </div>

        {/* Evening Energy & Challenge Reflection Log */}
        <form
          onSubmit={handleSaveReflection}
          className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs flex flex-col justify-between"
        >
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">{t('toolbox.reflectionTitle')}</h2>
            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                <span>Livello Energia Giornata (1–10)</span>
                <span className="font-mono-tabular text-purple-700">{energyScore}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={energyScore}
                onChange={(e) => setEnergyScore(Number(e.target.value))}
                className="w-full h-3 accent-purple-700 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Ostacolo principale di oggi & soluzione per domani:
              </label>
              <textarea
                rows={4}
                value={challengeNote}
                onChange={(e) => setChallengeNote(e.target.value)}
                placeholder="Es. Pomeriggio frenetico, ho compensato con una camminata serale di 15 min..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            {reflectionSaved && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                Riflessione serale salvata con successo.
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] py-2.5 rounded-xl text-white font-extrabold cursor-pointer"
            style={{ backgroundColor: theme.accent_primary }}
          >
            Salva Riflessione Serale
          </button>
        </form>
      </div>

      {/* SECTION 2: INTEGRATED PERSONAL TOOLBOX HUB (IT/EN) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Personal Toolbox Integrata (IT / EN)
              </div>
              <h2 className="text-lg font-extrabold">{t('toolbox.libraryTitle')}</h2>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono-tabular">7 Moduli Attivi</span>
        </div>

        <div className="grid lg:grid-cols-12">
          {/* Module Selector List */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 divide-y divide-slate-100">
            {PERSONAL_TOOLBOX_RESOURCES.map((res) => {
              const title = locale === 'en' ? res.title_en : res.title_it;
              const isSelected = res.id === activeResource.id;
              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => {
                    setSelectedResourceId(res.id);
                    setIsAudioPlaying(false);
                  }}
                  className={`w-full p-4 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-purple-50 text-purple-950' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-0.5">
                    {res.type}
                  </div>
                  <div className="text-xs font-extrabold leading-snug">{title}</div>
                </button>
              );
            })}
          </div>

          {/* Active Toolbox Resource Content */}
          <div className="lg:col-span-8 p-5 sm:p-6 space-y-5 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                {activeResource.code}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {locale === 'en' ? activeResource.title_en : activeResource.title_it}
              </h3>
              <p className="text-slate-600 mt-1">
                {locale === 'en' ? activeResource.subtitle_en : activeResource.subtitle_it}
              </p>
            </div>

            <div className="space-y-2">
              {(locale === 'en' ? activeResource.bullets_en : activeResource.bullets_it).map((b, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800">
                  {b}
                </div>
              ))}
            </div>

            {/* Interactive Assessment Worksheet */}
            {activeResource.interactive_questions && (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
                <div className="font-extrabold text-purple-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  Scheda Interattiva di Autovalutazione
                </div>
                {activeResource.interactive_questions.map((q) => {
                  const checked = !!worksheetChecks[q.id];
                  return (
                    <label
                      key={q.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-purple-100 cursor-pointer min-h-[44px]"
                    >
                      <span className="font-semibold text-slate-800">
                        {locale === 'en' ? q.label_en : q.label_it}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setWorksheetChecks((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                        }
                        className="w-4 h-4 accent-purple-700"
                      />
                    </label>
                  );
                })}
              </div>
            )}

            {/* Audio Mindset Pill Player */}
            {activeResource.type === 'AUDIO' && (
              <div className="p-5 rounded-2xl bg-slate-950 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Headphones className="w-5 h-5 text-purple-400" />
                    <span className="font-extrabold text-sm">Audio Mindset Pill · Coach Francesco</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold flex items-center gap-2 cursor-pointer"
                  >
                    {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isAudioPlaying ? 'Pausa Audio' : 'Ascolta Pillola'}
                  </button>
                </div>
                <blockquote className="text-xs text-slate-300 italic leading-relaxed border-l-2 border-purple-500 pl-3">
                  {locale === 'en' ? activeResource.audio_script_en : activeResource.audio_script_it}
                </blockquote>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
