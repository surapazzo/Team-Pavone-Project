/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { aggregateLogsByIsoWeek } from '../../services/bodybuildingLogic';
import { TrainingPhaseType } from '../../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';

interface MacrocycleWeightVolumeChartProps {
  initialWeightKg?: number;
  currentWeightKg?: number;
}

interface MacrocycleChartPoint {
  weekLabel: string;
  isoWeek: string;
  trainingPhase: TrainingPhaseType;
  trainingPhaseShort: string;
  nutritionPhase: string;
  isDeload: boolean;
  isLogged: boolean;
  actualWeightKg: number | null;
  targetWeightKg: number;
  deltaWeightPct: number | null;
  volumeSets: number;
  volumeSessions: number;
  plannedSets: number;
  plannedSessions: number;
  avgCaloriesKcal: number | null;
}

type ViewScope = 'FULL_MACROCYCLE' | 'LOGGED_ONLY';
type VolumeMetric = 'SETS' | 'SESSIONS';

const PHASE_SHORT_LABELS: Record<TrainingPhaseType, string> = {
  IPERTROFIA: 'Ipertrofia',
  FORZA: 'Forza',
  DELOAD: 'Deload',
  METABOLICO: 'Metabolico',
  GPP: 'GPP',
  TENSIONE: 'Tensione',
  IPERTROFIA_SARCO: 'Ipert. Sarco',
  NEURO: 'Neurale',
  AMPK: 'AMPK',
  HYPERDENSE: 'Hyperdense',
  CLUSTER: 'Cluster',
  HP_DOWNSETS: 'HP Downsets',
  HP_STRAIGHT_SS: 'HP SuperSet',
};

function getPhaseVolumeMultiplier(phase: TrainingPhaseType): number {
  switch (phase) {
    case 'DELOAD':
      return 0.55;
    case 'NEURO':
    case 'FORZA':
      return 0.85;
    case 'TENSIONE':
    case 'GPP':
      return 0.95;
    case 'IPERTROFIA':
    case 'IPERTROFIA_SARCO':
      return 1.05;
    case 'CLUSTER':
    case 'HP_DOWNSETS':
    case 'HP_STRAIGHT_SS':
      return 1.1;
    case 'HYPERDENSE':
    case 'METABOLICO':
    case 'AMPK':
      return 1.15;
    default:
      return 1.0;
  }
}

function getPlannedSessionsForPhase(phase: TrainingPhaseType): number {
  if (phase === 'DELOAD') return 3;
  if (phase === 'FORZA' || phase === 'NEURO') return 4;
  return 5;
}

export const MacrocycleWeightVolumeChart: React.FC<MacrocycleWeightVolumeChartProps> = ({
  initialWeightKg,
  currentWeightKg,
}) => {
  const {
    currentUser,
    dailyLogs,
    macrocycleWeeks,
    workoutPrograms,
  } = useApp();

  const [viewScope, setViewScope] = useState<ViewScope>('FULL_MACROCYCLE');
  const [volumeMetric, setVolumeMetric] = useState<VolumeMetric>('SETS');
  const [showTargetWeight, setShowTargetWeight] = useState<boolean>(true);

  const athleteLogs = useMemo(() => {
    return dailyLogs
      .filter((l) => l.athlete_id === currentUser.id)
      .sort((a, b) => a.log_date.localeCompare(b.log_date));
  }, [dailyLogs, currentUser.id]);

  // Average working sets per workout session derived from athlete's workout programs
  const avgSetsPerSession = useMemo(() => {
    const athleteProgs = workoutPrograms.filter((p) => p.athlete_id === currentUser.id && p.active);
    if (athleteProgs.length === 0) return 15;
    const totalSets = athleteProgs.reduce(
      (sum, prog) => sum + prog.exercises.reduce((exSum, ex) => exSum + (ex.sets || 0), 0),
      0
    );
    return Math.max(10, Math.round(totalSets / athleteProgs.length));
  }, [workoutPrograms, currentUser.id]);

  const weeklyAggregations = useMemo(() => {
    return aggregateLogsByIsoWeek(athleteLogs, 'DEFICIT', currentUser.experience_level);
  }, [athleteLogs, currentUser.experience_level]);

  const athleteMacroWeeks = useMemo(() => {
    return macrocycleWeeks
      .filter((w) => w.athlete_id === currentUser.id)
      .sort((a, b) => a.week_number - b.week_number);
  }, [macrocycleWeeks, currentUser.id]);

  const startWeight = initialWeightKg ?? currentUser.initial_weight_kg;
  const targetWeight = currentUser.target_weight_kg;

  // Build unified series combining macrocycle schedule with logged ISO week telemetry
  const fullSeries: MacrocycleChartPoint[] = useMemo(() => {
    const aggByWeek = new Map(weeklyAggregations.map((w) => [w.isoWeek, w]));

    if (athleteMacroWeeks.length > 0) {
      const totalWeeks = athleteMacroWeeks.length;
      const weightDeltaTotal = targetWeight - startWeight;

      return athleteMacroWeeks.map((mw, idx) => {
        const logged = aggByWeek.get(mw.iso_week);
        const progressRatio = totalWeeks > 1 ? idx / (totalWeeks - 1) : 1;
        const projectedWeight = Number((startWeight + weightDeltaTotal * progressRatio).toFixed(2));

        const plannedSessions = getPlannedSessionsForPhase(mw.training_phase);
        const plannedSets = Math.round(plannedSessions * avgSetsPerSession * getPhaseVolumeMultiplier(mw.training_phase));

        const actualSets = logged
          ? Math.round(logged.totalWorkouts * avgSetsPerSession * getPhaseVolumeMultiplier(mw.training_phase))
          : 0;

        return {
          weekLabel: `S${idx + 1}`,
          isoWeek: mw.iso_week,
          trainingPhase: mw.training_phase,
          trainingPhaseShort: PHASE_SHORT_LABELS[mw.training_phase] || mw.training_phase,
          nutritionPhase: mw.nutrition_phase,
          isDeload: mw.training_phase === 'DELOAD',
          isLogged: Boolean(logged),
          actualWeightKg: logged && logged.avgWeightKg > 0 ? logged.avgWeightKg : null,
          targetWeightKg: projectedWeight,
          deltaWeightPct: logged?.deltaWeightPct ?? null,
          volumeSets: logged ? actualSets : plannedSets,
          volumeSessions: logged ? logged.totalWorkouts : plannedSessions,
          plannedSets,
          plannedSessions,
          avgCaloriesKcal: logged?.avgCaloriesKcal ?? null,
        };
      });
    }

    // Fallback: synthesize series directly from logged weeks if athlete has no explicit macrocycle weeks
    return weeklyAggregations.map((w, idx) => {
      const total = Math.max(weeklyAggregations.length - 1, 1);
      const projected = Number((startWeight + ((targetWeight - startWeight) * idx) / total).toFixed(2));
      const sets = Math.round(w.totalWorkouts * avgSetsPerSession);
      return {
        weekLabel: `S${idx + 1}`,
        isoWeek: w.isoWeek,
        trainingPhase: 'IPERTROFIA',
        trainingPhaseShort: 'Ipertrofia',
        nutritionPhase: 'DEFICIT',
        isDeload: false,
        isLogged: true,
        actualWeightKg: w.avgWeightKg > 0 ? w.avgWeightKg : null,
        targetWeightKg: projected,
        deltaWeightPct: w.deltaWeightPct ?? null,
        volumeSets: sets,
        volumeSessions: w.totalWorkouts,
        plannedSets: sets,
        plannedSessions: w.totalWorkouts,
        avgCaloriesKcal: w.avgCaloriesKcal,
      };
    });
  }, [athleteMacroWeeks, weeklyAggregations, startWeight, targetWeight, avgSetsPerSession]);

  const displayedData = useMemo(() => {
    if (viewScope === 'LOGGED_ONLY') {
      return fullSeries.filter((p) => p.isLogged);
    }
    return fullSeries;
  }, [fullSeries, viewScope]);

  // Summary metrics calculated from real logged data
  const summaryStats = useMemo(() => {
    const loggedPoints = fullSeries.filter((p) => p.isLogged);
    const totalLoggedSets = loggedPoints.reduce((acc, p) => acc + p.volumeSets, 0);
    const totalLoggedSessions = loggedPoints.reduce((acc, p) => acc + p.volumeSessions, 0);
    const avgWeeklySets = loggedPoints.length > 0 ? Math.round(totalLoggedSets / loggedPoints.length) : 0;

    const latestLoggedWeight =
      loggedPoints.length > 0
        ? loggedPoints[loggedPoints.length - 1].actualWeightKg
        : currentWeightKg ?? startWeight;

    const resolvedCurrentWeight = latestLoggedWeight ?? startWeight;
    const netWeightChange = Number((resolvedCurrentWeight - startWeight).toFixed(2));

    const nextDeload = fullSeries.find((p) => p.isDeload && !p.isLogged) || fullSeries.find((p) => p.isDeload);

    return {
      loggedWeeksCount: loggedPoints.length,
      totalWeeksCount: fullSeries.length,
      totalLoggedSets,
      totalLoggedSessions,
      avgWeeklySets,
      resolvedCurrentWeight,
      netWeightChange,
      nextDeloadWeek: nextDeload ? `${nextDeload.weekLabel} (${nextDeload.isoWeek})` : 'N/D',
    };
  }, [fullSeries, currentWeightKg, startWeight]);

  // Weight axis bounds for clean framing
  const weightDomain = useMemo<[number, number]>(() => {
    const weights: number[] = [];
    displayedData.forEach((d) => {
      if (d.actualWeightKg !== null) weights.push(d.actualWeightKg);
      if (showTargetWeight) weights.push(d.targetWeightKg);
    });
    weights.push(targetWeight);
    if (weights.length === 0) return [70, 90];
    const min = Math.floor(Math.min(...weights) - 1);
    const max = Math.ceil(Math.max(...weights) + 1);
    return [min, max];
  }, [displayedData, showTargetWeight, targetWeight]);

  const activeVolumeKey = volumeMetric === 'SETS' ? 'volumeSets' : 'volumeSessions';

  return (
    <section
      aria-label="Andamento Peso Corporeo e Volume di Allenamento nel Macrociclo"
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-purple-700">Periodizzazione Macrociclo</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{summaryStats.totalWeeksCount} Settimane</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">Target {targetWeight} kg</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Curva Peso Corporeo &amp; Volume di Allenamento
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Correlazione tra andamento ponderale settimanale e modulazione del volume allenante (accumulo, densità e settimane di scarico).
          </p>
        </div>

        {/* Interactive Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Scope Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="group" aria-label="Intervallo visualizzato">
            <button
              type="button"
              onClick={() => setViewScope('FULL_MACROCYCLE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewScope === 'FULL_MACROCYCLE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Intero Macrociclo
            </button>
            <button
              type="button"
              onClick={() => setViewScope('LOGGED_ONLY')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewScope === 'LOGGED_ONLY'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Solo Registrate ({summaryStats.loggedWeeksCount})
            </button>
          </div>

          {/* Volume Metric Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="group" aria-label="Metrica di volume">
            <button
              type="button"
              onClick={() => setVolumeMetric('SETS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                volumeMetric === 'SETS'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Serie / Sett.
            </button>
            <button
              type="button"
              onClick={() => setVolumeMetric('SESSIONS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                volumeMetric === 'SESSIONS'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sessioni
            </button>
          </div>

          {/* Target Weight Line Toggle */}
          <button
            type="button"
            onClick={() => setShowTargetWeight((prev) => !prev)}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showTargetWeight
                ? 'bg-purple-50 text-purple-900 border-purple-200'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            {showTargetWeight ? 'Nascondi Target' : 'Mostra Target'}
          </button>
        </div>
      </div>

      {/* Main Chart Viewport */}
      {displayedData.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-xl p-6 space-y-2">
          <p className="text-sm font-semibold text-slate-800">
            Nessuna settimana registrata nel macrociclo corrente
          </p>
          <p className="text-xs text-slate-500 max-w-md">
            Registra almeno un log giornaliero o passa alla vista completa per visualizzare la pianificazione del macrociclo.
          </p>
          <button
            type="button"
            onClick={() => setViewScope('FULL_MACROCYCLE')}
            className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-purple-700 rounded-lg hover:bg-purple-800 transition-colors cursor-pointer"
          >
            Mostra Intero Macrociclo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Clean Inline Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                <span className="w-3 h-0.5 bg-purple-700 inline-block" />
                Peso Registrato (kg)
              </span>
              {showTargetWeight && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400 inline-block" />
                  Traiettoria Target (kg)
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 inline-block" />
                Volume Registrato ({volumeMetric === 'SETS' ? 'serie' : 'sessioni'})
              </span>
              {viewScope === 'FULL_MACROCYCLE' && (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 inline-block" />
                    Volume Pianificato
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block" />
                    Settimana Deload
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono-tabular">
              Media scheda: {avgSetsPerSession} serie / sessione
            </span>
          </div>

          {/* Recharts Dual-Axis ComposedChart */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={displayedData}
                margin={{ top: 14, right: 12, left: -10, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="weekLabel"
                  tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono, monospace' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="weight"
                  orientation="left"
                  domain={weightDomain}
                  tick={{ fontSize: 11, fill: '#6d28d9', fontFamily: 'JetBrains Mono, monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}kg`}
                />
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.2), volumeMetric === 'SETS' ? 100 : 7)]}
                  tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono, monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (volumeMetric === 'SETS' ? `${v}s` : `${v}`)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(109, 40, 217, 0.04)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const point = payload[0].payload as MacrocycleChartPoint;
                    return (
                      <div className="bg-white border border-slate-200 rounded-xl shadow-md p-3 text-xs space-y-2 min-w-[220px]">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-slate-900 font-mono-tabular">
                            {point.weekLabel} · {point.isoWeek}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {point.isLogged ? 'Registrata' : 'Pianificata'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600">
                          Fase: <strong className="text-slate-900">{point.trainingPhaseShort}</strong> · {point.nutritionPhase}
                        </div>

                        <div className="space-y-1 pt-1 border-t border-slate-100 font-mono-tabular">
                          {point.actualWeightKg !== null && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Peso Medio Reale:</span>
                              <span className="font-bold text-purple-800">{point.actualWeightKg} kg</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Peso Target Macro:</span>
                            <span className="font-semibold text-slate-700">{point.targetWeightKg} kg</span>
                          </div>
                          {point.deltaWeightPct !== null && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Variazione Sett.:</span>
                              <span className={`font-semibold ${point.deltaWeightPct <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {point.deltaWeightPct > 0 ? `+${point.deltaWeightPct}%` : `${point.deltaWeightPct}%`}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 pt-1 border-t border-slate-100 font-mono-tabular">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">
                              {point.isLogged ? 'Volume Eseguito:' : 'Volume Programmato:'}
                            </span>
                            <span className="font-bold text-indigo-700">
                              {point.volumeSets} serie ({point.volumeSessions} sess.)
                            </span>
                          </div>
                          {point.avgCaloriesKcal !== null && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Media Calorie:</span>
                              <span className="font-semibold text-slate-700">{point.avgCaloriesKcal} kcal</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />

                {showTargetWeight && (
                  <ReferenceLine
                    yAxisId="weight"
                    y={targetWeight}
                    stroke="#16a34a"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                  />
                )}

                <Bar
                  yAxisId="volume"
                  dataKey={activeVolumeKey}
                  barSize={viewScope === 'FULL_MACROCYCLE' ? 24 : 36}
                  radius={[4, 4, 0, 0]}
                  name={volumeMetric === 'SETS' ? 'Serie Allenanti' : 'Sessioni'}
                >
                  {displayedData.map((entry, idx) => {
                    let fillColor = '#cbd5e1'; // planned standard
                    if (entry.isLogged) {
                      fillColor = entry.isDeload ? '#d97706' : '#4f46e5';
                    } else if (entry.isDeload) {
                      fillColor = '#fcd34d';
                    }
                    return <Cell key={`vol-bar-${entry.isoWeek}-${idx}`} fill={fillColor} />;
                  })}
                </Bar>

                {showTargetWeight && (
                  <Line
                    yAxisId="weight"
                    type="monotone"
                    dataKey="targetWeightKg"
                    stroke="#94a3b8"
                    strokeWidth={1.75}
                    strokeDasharray="5 4"
                    dot={false}
                    activeDot={{ r: 4, fill: '#64748b' }}
                    name="Peso Target (kg)"
                  />
                )}

                <Line
                  yAxisId="weight"
                  type="monotone"
                  dataKey="actualWeightKg"
                  stroke="#6d28d9"
                  strokeWidth={2.75}
                  connectNulls={false}
                  dot={{ r: 4, fill: '#6d28d9', stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#6d28d9', stroke: '#ffffff', strokeWidth: 2 }}
                  name="Peso Medio Reale (kg)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Hairline-Separated Summary Metrics Strip (Single-Elevation Depth) */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x lg:divide-slate-100">
        <div className="lg:pr-6">
          <div className="text-xs text-slate-500">Variazione Ponderale Macrociclo</div>
          <div className="mt-1 flex items-baseline gap-2 font-mono-tabular">
            <span className="text-lg font-bold text-slate-900">
              {summaryStats.resolvedCurrentWeight} kg
            </span>
            <span className={`text-xs font-semibold ${summaryStats.netWeightChange <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {summaryStats.netWeightChange > 0 ? `+${summaryStats.netWeightChange}` : summaryStats.netWeightChange} kg vs inizio
            </span>
          </div>
        </div>

        <div className="lg:px-6">
          <div className="text-xs text-slate-500">Volume Medio Settimanale</div>
          <div className="mt-1 flex items-baseline gap-2 font-mono-tabular">
            <span className="text-lg font-bold text-slate-900">
              {summaryStats.avgWeeklySets} serie
            </span>
            <span className="text-xs text-slate-500">
              / settimana registrata
            </span>
          </div>
        </div>

        <div className="lg:px-6">
          <div className="text-xs text-slate-500">Volume Cumulato Registrato</div>
          <div className="mt-1 flex items-baseline gap-2 font-mono-tabular">
            <span className="text-lg font-bold text-slate-900">
              {summaryStats.totalLoggedSets} serie
            </span>
            <span className="text-xs text-slate-500">
              ({summaryStats.totalLoggedSessions} sessioni)
            </span>
          </div>
        </div>

        <div className="lg:pl-6">
          <div className="text-xs text-slate-500">Prossimo Scarico Programmato</div>
          <div className="mt-1 flex items-baseline gap-2 font-mono-tabular">
            <span className="text-lg font-bold text-amber-700">
              {summaryStats.nextDeloadWeek}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
