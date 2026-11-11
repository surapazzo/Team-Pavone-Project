/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MacrocycleWeek } from '../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Footprints,
  Target,
  ChevronRight,
  Sparkles,
  Dumbbell,
  Zap,
  Info,
} from 'lucide-react';

interface MacrocycleProgressBarProps {
  currentWeightKg?: number;
  initialWeightKg?: number;
}

export const MacrocycleProgressBar: React.FC<MacrocycleProgressBarProps> = ({
  currentWeightKg,
  initialWeightKg,
}) => {
  const {
    currentUser,
    macrocycleWeeks,
    updateMacrocycleWeek,
    setCurrentRoute,
    theme,
  } = useApp();

  // Filter weeks for this athlete sorted by week_number
  const athleteWeeks = useMemo(() => {
    return macrocycleWeeks
      .filter((w) => w.athlete_id === currentUser.id)
      .sort((a, b) => a.week_number - b.week_number);
  }, [macrocycleWeeks, currentUser.id]);

  const totalWeeks = Math.max(athleteWeeks.length, 1);

  // Active week state: default to week index 1 (Week 2 of the cycle, e.g. 2026-W11) or from localStorage
  const [activeWeekIndex, setActiveWeekIndex] = useState<number>(() => {
    const saved = localStorage.getItem(`ttp_active_week_${currentUser.id}`);
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (!isNaN(idx) && idx >= 0 && idx < totalWeeks) return idx;
    }
    // Default to index 1 (second week) if exists, else 0
    return totalWeeks > 1 ? 1 : 0;
  });

  // Selected week for detail inspector (defaults to active week)
  const [inspectedWeekIndex, setInspectedWeekIndex] = useState<number>(activeWeekIndex);

  const activeWeek: MacrocycleWeek | undefined = athleteWeeks[activeWeekIndex] || athleteWeeks[0];
  const inspectedWeek: MacrocycleWeek | undefined = athleteWeeks[inspectedWeekIndex] || activeWeek;

  // Calculate percentage: (completed full weeks + active week progress) / total weeks
  // Assuming active week is midway (e.g. day 4 of 7 = 0.57)
  const completionPercentage = useMemo(() => {
    if (totalWeeks === 0) return 0;
    // Current week is index `activeWeekIndex` (0-indexed, e.g. index 1 is week 2)
    // Completed full weeks = activeWeekIndex
    // Within current week: assume 4 days elapsed out of 7 (~0.57 of current week)
    const weeksElapsed = activeWeekIndex + 0.57;
    const rawPct = (weeksElapsed / totalWeeks) * 100;
    return Math.min(100, Math.max(0, Math.round(rawPct)));
  }, [activeWeekIndex, totalWeeks]);

  const daysRemaining = Math.max(0, (totalWeeks - activeWeekIndex - 1) * 7 + 3);

  // Weight goal convergence calculation
  const startWeight = initialWeightKg ?? currentUser.initial_weight_kg;
  const currWeight = currentWeightKg ?? currentUser.initial_weight_kg;
  const targetWeight = currentUser.target_weight_kg;
  const isCutting = targetWeight < startWeight;

  const totalWeightDeltaNeeded = Math.abs(startWeight - targetWeight);
  const currentWeightDeltaAchieved = isCutting
    ? Math.max(0, startWeight - currWeight)
    : Math.max(0, currWeight - startWeight);

  const weightProgressPct = totalWeightDeltaNeeded > 0
    ? Math.min(100, Math.max(0, Math.round((currentWeightDeltaAchieved / totalWeightDeltaNeeded) * 100)))
    : 100;

  const handleSelectWeek = (index: number) => {
    setInspectedWeekIndex(index);
  };

  const handleSetCurrentWeek = (index: number) => {
    setActiveWeekIndex(index);
    setInspectedWeekIndex(index);
    localStorage.setItem(`ttp_active_week_${currentUser.id}`, String(index));
  };

  // Group weeks into high-level mesocycle blocks for visual phase labels
  const mesocycles = useMemo(() => {
    return [
      { name: 'Meso 1: Adattamento & Tensione', range: 'Sett. 1 - 3', start: 0, end: 2, color: 'text-purple-700' },
      { name: 'Diet Break / Deload', range: 'Sett. 4', start: 3, end: 3, color: 'text-amber-700' },
      { name: 'Meso 2: Ipertrofia & Overload', range: 'Sett. 5 - 7', start: 4, end: 6, color: 'text-indigo-700' },
      { name: 'Deload Fisiologico', range: 'Sett. 8', start: 7, end: 7, color: 'text-amber-700' },
      { name: 'Meso 3: Densità & Rifinitura', range: 'Sett. 9 - 11', start: 8, end: 10, color: 'text-purple-800' },
      { name: 'Peak Week & Ricarica', range: 'Sett. 12', start: 11, end: 11, color: 'text-emerald-700' },
    ];
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      {/* 1. Header with Title & Percentage Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-bold text-purple-700 uppercase tracking-wider">Macrociclo Periodizzato</span>
            <span aria-hidden="true">·</span>
            <span>Periodo Competitivo / Taglio</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{totalWeeks} Settimane Totali</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Avanzamento del Macrociclo</span>
            {activeWeek && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                {activeWeek.iso_week}
              </span>
            )}
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Settimana attiva <strong className="text-slate-800 font-mono-tabular">{activeWeekIndex + 1} di {totalWeeks}</strong> · Fase:{' '}
            <strong className="text-purple-900">{activeWeek?.training_phase || 'Tensione'}</strong> ({activeWeek?.nutrition_phase || 'Deficit'}) ·{' '}
            <span className="text-slate-600 font-mono-tabular">{daysRemaining} giorni rimanenti</span>
          </p>
        </div>

        {/* Big Tabular Percentage Counter */}
        <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2 sm:gap-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-purple-900 font-mono-tabular tracking-tight">
              {completionPercentage}%
            </span>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Completato
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono-tabular">
            {activeWeekIndex + 1}/{totalWeeks} Settimane Pianificate
          </span>
        </div>
      </div>

      {/* 2. Primary Visual Progress Bar Track */}
      <div className="space-y-3">
        {/* Progress Bar Frame */}
        <div className="relative">
          {/* Background Track */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
            {/* Active Fill Gradient */}
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600 relative"
              style={{ width: `${completionPercentage}%` }}
            >
              {/* Subtle light shimmer indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Marker pins for the 12 weeks */}
          <div className="absolute inset-0 flex justify-between items-center pointer-events-none px-1">
            {Array.from({ length: totalWeeks }).map((_, idx) => {
              const isPast = idx < activeWeekIndex;
              const isCurrent = idx === activeWeekIndex;
              return (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full border-2 transition-transform ${
                    isCurrent
                      ? 'bg-white border-purple-800 scale-125 shadow-xs'
                      : isPast
                      ? 'bg-purple-900 border-white'
                      : 'bg-white border-slate-300'
                  }`}
                  title={`Settimana ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Clickable Week Segments Bar for Detailed Inspection */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-1">
          {athleteWeeks.map((week, idx) => {
            const isCompleted = idx < activeWeekIndex;
            const isCurrent = idx === activeWeekIndex;
            const isInspected = idx === inspectedWeekIndex;

            return (
              <button
                key={week.id}
                onClick={() => handleSelectWeek(idx)}
                className={`group p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between items-center relative ${
                  isInspected
                    ? 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/70 shadow-xs'
                    : isCurrent
                    ? 'border-purple-300 bg-purple-50/30'
                    : isCompleted
                    ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    : 'border-dashed border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                {/* Week Label */}
                <span className="text-[10px] font-bold font-mono-tabular block text-slate-700 group-hover:text-purple-700">
                  W{idx + 1}
                </span>

                {/* Status Dot / Icon */}
                <div className="my-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 rounded-full bg-purple-700 animate-pulse flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border border-slate-300" />
                  )}
                </div>

                {/* Phase Shortcode */}
                <span className="text-[9px] font-medium text-slate-500 truncate w-full block">
                  {week.training_phase === 'DELOAD'
                    ? 'Deload'
                    : week.training_phase === 'IPERTROFIA_SARCO'
                    ? 'Sarco'
                    : week.training_phase.slice(0, 5)}
                </span>

                {/* Current Badge Tag */}
                {isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-700 text-white text-[8px] font-black px-1 rounded-sm shadow-2xs whitespace-nowrap">
                    ORA
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Inspector for Selected Week */}
      {inspectedWeek && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-700 text-white font-bold text-xs flex items-center justify-center font-mono-tabular">
                W{inspectedWeekIndex + 1}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Dettagli Settimana {inspectedWeek.iso_week}
                  {inspectedWeekIndex === activeWeekIndex && (
                    <span className="ml-2 text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      Settimana in Corso
                    </span>
                  )}
                </h4>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>Allenamento: <strong className="text-slate-800">{inspectedWeek.training_phase}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Dieta: <strong className="text-slate-800">{inspectedWeek.nutrition_phase}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {inspectedWeekIndex !== activeWeekIndex && (
                <button
                  onClick={() => handleSetCurrentWeek(inspectedWeekIndex)}
                  className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  Imposta come Settimana Attiva
                </button>
              )}
              <button
                onClick={() => setCurrentRoute('/app/calendar')}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Visualizza Calendario Completo</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid for the Selected Week */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200/60">
              <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1 uppercase tracking-wider mb-0.5">
                <Flame className="w-3 h-3" /> Target Kcal ON / OFF
              </span>
              <div className="text-sm font-black text-slate-900 font-mono-tabular">
                {inspectedWeek.target_kcal_on} <span className="text-[10px] text-slate-400 font-normal">/</span> {inspectedWeek.target_kcal_off} <span className="text-[10px] text-slate-400 font-normal">kcal</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {inspectedWeek.target_carbs_on_g}g C (ON) · {inspectedWeek.target_carbs_off_g}g C (OFF)
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200/60">
              <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1 uppercase tracking-wider mb-0.5">
                <Dumbbell className="w-3 h-3" /> Proteine & Grassi
              </span>
              <div className="text-sm font-black text-slate-900 font-mono-tabular">
                {inspectedWeek.target_protein_g}g <span className="text-[10px] text-slate-400 font-normal">Pro</span> · {inspectedWeek.target_fats_g}g <span className="text-[10px] text-slate-400 font-normal">Fat</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Stabilità ormonale e anticatabolismo
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200/60">
              <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-1 uppercase tracking-wider mb-0.5">
                <Footprints className="w-3 h-3" /> Passi Target Giornalieri
              </span>
              <div className="text-sm font-black text-slate-900 font-mono-tabular">
                {inspectedWeek.target_steps_daily.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Spesa NEAT non affaticante
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 uppercase tracking-wider mb-0.5">
                <Clock className="w-3 h-3" /> Prescrizione Cardio
              </span>
              <div className="text-xs font-medium text-slate-800 line-clamp-2">
                {inspectedWeek.cardio_prescription}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Target Weight Convergence Sub-Bar */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-purple-700" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Convergenza Verso il Peso Target ({targetWeight} kg)
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>Inizio: <strong className="font-mono-tabular text-slate-700">{startWeight} kg</strong></span>
              <span aria-hidden="true">→</span>
              <span>Attuale: <strong className="font-mono-tabular text-purple-700">{currWeight} kg</strong></span>
              <span aria-hidden="true">→</span>
              <span>Obiettivo: <strong className="font-mono-tabular text-emerald-700">{targetWeight} kg</strong></span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-500">Avanzamento Target</span>
            <span className="font-bold text-purple-900 font-mono-tabular">{weightProgressPct}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${weightProgressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
