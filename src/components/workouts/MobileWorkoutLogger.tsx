/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WorkoutProgram,
  WorkoutSetLog,
  MuscleGroup,
  JointType,
  ResistanceProfileBias,
} from '../../types';
import {
  Play,
  Square,
  Check,
  Clock,
  Dumbbell,
  Youtube,
  X,
  Plus,
  Flame,
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface MobileWorkoutLoggerProps {
  program: WorkoutProgram;
  onComplete?: () => void;
}

const RESISTANCE_LABELS: Record<ResistanceProfileBias, string> = {
  LENGTHENED: 'Allungamento (Lengthened)',
  MID_RANGE: 'Medio Range',
  SHORTENED: 'Accorciamento (Shortened)',
};

export const MobileWorkoutLogger: React.FC<MobileWorkoutLoggerProps> = ({
  program,
  onComplete,
}) => {
  const { currentUser, logWorkoutSession, exerciseLibrary, theme } = useApp();
  const { t } = useTranslation();

  const [isRunning, setIsRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 3-Phase Perceived Effort (1-10)
  const [preEffort, setPreEffort] = useState(6);
  const [intraEffort, setIntraEffort] = useState(8);
  const [postEffort, setPostEffort] = useState(8);
  const [sessionNotes, setSessionNotes] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // YouTube tutorial popup
  const [videoPreview, setVideoPreview] = useState<{ title: string; embedUrl: string } | null>(null);

  // Build set rows from program exercises
  const [setLogs, setSetLogs] = useState<WorkoutSetLog[]>(() => {
    const rows: WorkoutSetLog[] = [];
    program.exercises.forEach((ex) => {
      const libMatch = exerciseLibrary.find(
        (l) => l.id === ex.library_exercise_id || l.name === ex.name
      );
      const primaryMuscle: MuscleGroup =
        ex.primary_muscle || ex.muscle_group || libMatch?.primary_muscle || 'PETTORALI';
      const secondaryMuscle: MuscleGroup | undefined =
        ex.secondary_muscle || libMatch?.secondary_muscle;
      const jointType: JointType = ex.joint_type || libMatch?.joint_type || 'MULTI_JOINT';
      const profileBias: ResistanceProfileBias =
        ex.resistance_profile_bias || libMatch?.resistance_profile_bias || 'LENGTHENED';

      for (let s = 1; s <= ex.sets; s++) {
        rows.push({
          id: `${ex.id}-set-${s}`,
          exercise_id: ex.id,
          exercise_name: ex.name,
          primary_muscle: primaryMuscle,
          secondary_muscle: secondaryMuscle,
          joint_type: jointType,
          resistance_profile_bias: profileBias,
          set_number: s,
          weight_kg: 40,
          reps: 8,
          rpe_rir: ex.rir ?? 1,
          completed: false,
        });
      }
    });
    return rows;
  });

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const handleStartSession = () => {
    setStartedAt(new Date().toISOString());
    setIsRunning(true);
    setElapsedSeconds(0);
    setSavedFeedback(null);
  };

  const updateSetField = (
    setId: string,
    field: 'weight_kg' | 'reps' | 'rpe_rir' | 'completed',
    value: number | boolean
  ) => {
    if (!isRunning && field === 'completed' && value === true) {
      setStartedAt(new Date().toISOString());
      setIsRunning(true);
    }
    setSetLogs((prev) =>
      prev.map((row) => (row.id === setId ? { ...row, [field]: value } : row))
    );
  };

  const addExtraSet = (exerciseId: string) => {
    const existing = setLogs.filter((s) => s.exercise_id === exerciseId);
    const template = existing[existing.length - 1];
    if (!template) return;
    const newSet: WorkoutSetLog = {
      ...template,
      id: `${exerciseId}-set-${Date.now()}`,
      set_number: existing.length + 1,
      completed: false,
    };
    setSetLogs((prev) => [...prev, newSet]);
  };

  const completedSets = setLogs.filter((s) => s.completed);
  const liveTonnage = completedSets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0);

  const handleFinishSession = () => {
    const endIso = new Date().toISOString();
    const startIso = startedAt || new Date(Date.now() - 45 * 60000).toISOString();
    const durationMin = Math.max(
      1,
      Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000) ||
        Math.round(elapsedSeconds / 60) ||
        45
    );

    const setsToSave = completedSets.length > 0 ? completedSets : setLogs.map((s) => ({ ...s, completed: true }));
    const totalTonnage = setsToSave.reduce((sum, s) => sum + s.weight_kg * s.reps, 0);

    const { newRecords } = logWorkoutSession({
      athlete_id: currentUser.id,
      program_id: program.id,
      split_day: program.split_day,
      session_date: new Date().toISOString().split('T')[0],
      started_at: startIso,
      ended_at: endIso,
      session_duration_minutes: durationMin,
      pre_workout_effort: preEffort,
      intra_workout_effort: intraEffort,
      post_workout_effort: postEffort,
      total_tonnage_kg: totalTonnage,
      sets: setsToSave,
      notes: sessionNotes,
    });

    setIsRunning(false);
    setSavedFeedback(
      `Sessione salvata (${durationMin} min · ${totalTonnage.toLocaleString()} kg tonnellaggio)${
        newRecords.length > 0 ? ` · ${newRecords.length} nuovo Record sbloccato!` : ''
      }`
    );
    if (onComplete) onComplete();
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getEmbedUrl = (videoUrl?: string, youtubeId?: string) => {
    if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;
    if (videoUrl) return videoUrl;
    return 'https://www.youtube.com/embed/IHpn5VqLlG4';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Timer Bar */}
      <div className="p-4 sm:p-5 bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
            {t('workout.loggerTitle')} · {program.split_day}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xl font-black font-mono-tabular flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              {formatDuration(elapsedSeconds)}
            </span>
            <span className="text-xs text-slate-300 font-mono-tabular">
              Tonnellaggio: <strong className="text-white">{liveTonnage.toLocaleString()} kg</strong>
            </span>
            <span className="text-xs text-slate-400 font-mono-tabular">
              Serie: {completedSets.length}/{setLogs.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStartSession}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold text-white flex items-center gap-2 shadow-sm cursor-pointer"
              style={{ backgroundColor: theme.accent_primary }}
            >
              <Play className="w-4 h-4" />
              {t('workout.startSession')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishSession}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              {t('workout.finishSession')}
            </button>
          )}
        </div>
      </div>

      {savedFeedback && (
        <div className="mx-4 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
          {savedFeedback}
        </div>
      )}

      {/* Pre-Workout Effort Slider (1-10) */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span>{t('workout.preEffort')}</span>
              <span className="font-mono-tabular text-purple-700">{preEffort}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={preEffort}
              onChange={(e) => setPreEffort(Number(e.target.value))}
              className="w-full h-3 accent-purple-700 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span>{t('workout.intraEffort')}</span>
              <span className="font-mono-tabular text-purple-700">{intraEffort}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={intraEffort}
              onChange={(e) => setIntraEffort(Number(e.target.value))}
              className="w-full h-3 accent-purple-700 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span>{t('workout.postEffort')}</span>
              <span className="font-mono-tabular text-purple-700">{postEffort}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={postEffort}
              onChange={(e) => setPostEffort(Number(e.target.value))}
              className="w-full h-3 accent-purple-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Exercise Set Rows */}
      <div className="divide-y divide-slate-100">
        {program.exercises.map((ex, exIdx) => {
          const exSets = setLogs.filter((s) => s.exercise_id === ex.id);
          const libMatch = exerciseLibrary.find(
            (l) => l.id === ex.library_exercise_id || l.name === ex.name
          );
          const bias = ex.resistance_profile_bias || libMatch?.resistance_profile_bias || 'LENGTHENED';
          const jType = ex.joint_type || libMatch?.joint_type || 'MULTI_JOINT';
          const embedUrl = getEmbedUrl(ex.video_url || libMatch?.video_url, ex.youtube_video_id || libMatch?.youtube_video_id);

          return (
            <div key={ex.id} className="p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center font-mono-tabular">
                      {exIdx + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{ex.name}</h3>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    <span>{jType === 'MULTI_JOINT' ? 'Multi-Articolare' : 'Mono-Articolare'}</span>
                    <span>·</span>
                    <span>{RESISTANCE_LABELS[bias]}</span>
                    <span>·</span>
                    <span className="font-mono-tabular">Target: {ex.sets}×{ex.reps} (RIR {ex.rir})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoPreview({ title: ex.name, embedUrl })}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Youtube className="w-4 h-4 text-rose-600" />
                    Tutorial
                  </button>
                  <button
                    type="button"
                    onClick={() => addExtraSet(ex.id)}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Serie
                  </button>
                </div>
              </div>

              {/* Set Header */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                <div className="col-span-2">Set</div>
                <div className="col-span-3">Kg</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-2">RIR</div>
                <div className="col-span-2 text-right">Log</div>
              </div>

              <div className="space-y-2">
                {exSets.map((row) => (
                  <div
                    key={row.id}
                    className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl border transition-colors ${
                      row.completed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="col-span-2 text-xs font-extrabold font-mono-tabular text-slate-700 pl-2">
                      #{row.set_number}
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="0.5"
                        value={row.weight_kg}
                        onChange={(e) => updateSetField(row.id, 'weight_kg', parseFloat(e.target.value) || 0)}
                        className="w-full min-h-[44px] px-2 bg-white border border-slate-300 rounded-lg text-center text-sm font-bold font-mono-tabular text-slate-900"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={row.reps}
                        onChange={(e) => updateSetField(row.id, 'reps', parseInt(e.target.value, 10) || 0)}
                        className="w-full min-h-[44px] px-2 bg-white border border-slate-300 rounded-lg text-center text-sm font-bold font-mono-tabular text-slate-900"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={row.rpe_rir}
                        onChange={(e) => updateSetField(row.id, 'rpe_rir', parseInt(e.target.value, 10) || 0)}
                        className="w-full min-h-[44px] px-1 bg-white border border-slate-300 rounded-lg text-center text-sm font-bold font-mono-tabular text-purple-700"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => updateSetField(row.id, 'completed', !row.completed)}
                        aria-label={`Completa serie ${row.set_number}`}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          row.completed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes & Save Footer */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <input
          type="text"
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Note tecniche sessione (es. pump, articolazioni, progressione)..."
          className="flex-1 min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
        />
        <button
          type="button"
          onClick={handleFinishSession}
          className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          style={{ backgroundColor: theme.accent_primary }}
        >
          <Flame className="w-4 h-4" />
          {t('workout.finishSession')}
        </button>
      </div>

      {/* YouTube Tutorial Modal */}
      {videoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Dumbbell className="w-4 h-4 text-purple-400" />
                <span>{videoPreview.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setVideoPreview(null)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative pt-[56.25%] bg-black">
              <iframe
                src={videoPreview.embedUrl}
                title={videoPreview.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
