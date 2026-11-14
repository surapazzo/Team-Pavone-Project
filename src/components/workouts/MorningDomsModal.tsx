/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MuscleGroup, DomsMuscleScore } from '../../types';
import { Activity, X, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

const MUSCLE_OPTIONS: Array<{ value: MuscleGroup; label: string }> = [
  { value: 'PETTORALI', label: 'Pettorali' },
  { value: 'DORSALI', label: 'Dorsali' },
  { value: 'SPALLE', label: 'Spalle' },
  { value: 'QUADRICIPITI', label: 'Quadricipiti' },
  { value: 'FEMORALI_GLUTEI', label: 'Femorali & Glutei' },
  { value: 'BICIPITI', label: 'Bicipiti' },
  { value: 'TRICIPITI', label: 'Tricipiti' },
  { value: 'CORE_ADDOME', label: 'Core & Addome' },
  { value: 'POLPACCI', label: 'Polpacci' },
];

export const MorningDomsModal: React.FC = () => {
  const { isMorningDomsModalOpen, setIsMorningDomsModalOpen, submitMorningDoms, workoutSessions } = useApp();
  const { t } = useTranslation();

  const [hasSoreness, setHasSoreness] = useState(true);
  const [selectedMuscles, setSelectedMuscles] = useState<DomsMuscleScore[]>([
    { muscle: 'QUADRICIPITI', soreness: 7 },
  ]);

  if (!isMorningDomsModalOpen) return null;

  const lastSession = workoutSessions[0];

  const handleToggleMuscle = (muscle: MuscleGroup) => {
    const exists = selectedMuscles.some((m) => m.muscle === muscle);
    if (exists) {
      setSelectedMuscles((prev) => prev.filter((m) => m.muscle !== muscle));
    } else {
      setSelectedMuscles((prev) => [...prev, { muscle, soreness: 6 }]);
    }
  };

  const handleUpdateScore = (muscle: MuscleGroup, soreness: number) => {
    setSelectedMuscles((prev) =>
      prev.map((m) => (m.muscle === muscle ? { ...m, soreness } : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMorningDoms(hasSoreness, selectedMuscles, lastSession?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Check-In Recupero Mattutino
              </div>
              <h3 className="text-sm font-extrabold">DOMS & Indolenzimento Post-Sessione</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMorningDomsModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 font-bold text-sm leading-snug">
            {t('workout.domsTitle')}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setHasSoreness(true)}
              className={`min-h-[44px] py-2.5 rounded-xl font-bold border cursor-pointer ${
                hasSoreness
                  ? 'bg-purple-700 text-white border-purple-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Sì, ho dolori (DOMS)
            </button>
            <button
              type="button"
              onClick={() => setHasSoreness(false)}
              className={`min-h-[44px] py-2.5 rounded-xl font-bold border cursor-pointer ${
                !hasSoreness
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              No, recupero completo
            </button>
          </div>

          {hasSoreness && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Seleziona i distretti muscolari interessati (Multi-selezione):
                </label>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_OPTIONS.map((opt) => {
                    const active = selectedMuscles.some((m) => m.muscle === opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleToggleMuscle(opt.value)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMuscles.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {selectedMuscles.map((item) => {
                    const label = MUSCLE_OPTIONS.find((m) => m.value === item.muscle)?.label || item.muscle;
                    return (
                      <div key={item.muscle} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-900">{label}</span>
                          <span className="font-mono-tabular font-black text-purple-700">
                            {item.soreness}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={item.soreness}
                          onChange={(e) => handleUpdateScore(item.muscle, Number(e.target.value))}
                          className="w-full h-3 accent-purple-700 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[46px] py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('workout.domsSave')}
          </button>
        </form>
      </div>
    </div>
  );
};
