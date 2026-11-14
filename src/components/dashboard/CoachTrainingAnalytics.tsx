/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Dumbbell, Activity, Clock, Gauge, Flame } from 'lucide-react';

const PIE_COLORS = ['#6D28D9', '#0EA5E9', '#10B981'];
const JOINT_COLORS = ['#1E293B', '#8B5CF6'];

export const CoachTrainingAnalytics: React.FC = () => {
  const { selectedAthlete, workoutSessions, morningDomsLogs } = useApp();

  const athleteSessions = useMemo(
    () =>
      workoutSessions
        .filter((s) => s.athlete_id === selectedAthlete.id)
        .sort((a, b) => a.session_date.localeCompare(b.session_date)),
    [workoutSessions, selectedAthlete.id]
  );

  const athleteDoms = useMemo(
    () => morningDomsLogs.filter((d) => d.athlete_id === selectedAthlete.id),
    [morningDomsLogs, selectedAthlete.id]
  );

  const analytics = useMemo(() => {
    const allSets = athleteSessions.flatMap((s) => s.sets.filter((st) => st.completed));
    const totalSets = allSets.length;
    const totalTonnage = allSets.reduce((sum, st) => sum + st.weight_kg * st.reps, 0);
    const avgWeight = totalSets > 0 ? Number((allSets.reduce((s, st) => s + st.weight_kg, 0) / totalSets).toFixed(1)) : 0;
    const avgRir = totalSets > 0 ? Number((allSets.reduce((s, st) => s + st.rpe_rir, 0) / totalSets).toFixed(1)) : 0;
    const avgDuration =
      athleteSessions.length > 0
        ? Math.round(athleteSessions.reduce((s, ws) => s + ws.session_duration_minutes, 0) / athleteSessions.length)
        : 0;

    // Group by primary muscle
    const muscleMap: Record<string, { muscle: string; sets: number; tonnage: number; weightSum: number }> = {};
    let lengthenedCount = 0;
    let midRangeCount = 0;
    let shortenedCount = 0;
    let multiJointCount = 0;
    let singleJointCount = 0;

    allSets.forEach((st) => {
      if (!muscleMap[st.primary_muscle]) {
        muscleMap[st.primary_muscle] = { muscle: st.primary_muscle, sets: 0, tonnage: 0, weightSum: 0 };
      }
      muscleMap[st.primary_muscle].sets += 1;
      muscleMap[st.primary_muscle].tonnage += st.weight_kg * st.reps;
      muscleMap[st.primary_muscle].weightSum += st.weight_kg;

      if (st.resistance_profile_bias === 'LENGTHENED') lengthenedCount++;
      else if (st.resistance_profile_bias === 'MID_RANGE') midRangeCount++;
      else shortenedCount++;

      if (st.joint_type === 'MULTI_JOINT') multiJointCount++;
      else singleJointCount++;
    });

    const muscleRows = Object.values(muscleMap).map((m) => ({
      muscle: m.muscle,
      sets: m.sets,
      tonnage: Math.round(m.tonnage),
      loadIntensity: Number((m.weightSum / m.sets).toFixed(1)),
    }));

    const profilePieData = [
      { name: 'Lengthened', value: lengthenedCount },
      { name: 'Mid-Range', value: midRangeCount },
      { name: 'Shortened', value: shortenedCount },
    ].filter((d) => d.value > 0);

    const jointPieData = [
      { name: 'Multi-Joint', value: multiJointCount },
      { name: 'Single-Joint', value: singleJointCount },
    ].filter((d) => d.value > 0);

    const effortTrendData = athleteSessions.map((ws) => ({
      date: ws.session_date.slice(5),
      Pre: ws.pre_workout_effort,
      Durante: ws.intra_workout_effort,
      Post: ws.post_workout_effort,
    }));

    // Monthly average DOMS per muscle
    const domsMap: Record<string, { sum: number; count: number }> = {};
    athleteDoms.forEach((d) => {
      d.muscle_scores.forEach((ms) => {
        if (!domsMap[ms.muscle]) domsMap[ms.muscle] = { sum: 0, count: 0 };
        domsMap[ms.muscle].sum += ms.soreness;
        domsMap[ms.muscle].count += 1;
      });
    });

    const domsChartData = Object.entries(domsMap).map(([muscle, val]) => ({
      muscle: muscle.replace('_', ' '),
      avgDoms: Number((val.sum / val.count).toFixed(1)),
    }));

    return {
      totalSets,
      totalTonnage,
      avgWeight,
      avgRir,
      avgDuration,
      weeklyFrequency: Math.max(athleteSessions.length, 4),
      muscleRows,
      profilePieData,
      jointPieData,
      effortTrendData,
      domsChartData,
    };
  }, [athleteSessions, athleteDoms]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
            Modulo 1 · Analytics Biomeccanici & Fatica
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">
            Analisi Allenamento, Profili di Resistenza & DOMS ({selectedAthlete.full_name})
          </h2>
        </div>
        <span className="text-xs font-mono-tabular font-bold text-slate-600">
          {athleteSessions.length} sessioni registrate
        </span>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5 text-purple-700" /> Serie Allenanti
          </div>
          <div className="text-xl font-black font-mono-tabular text-slate-900 mt-1">
            {analytics.totalSets}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-600" /> Tonnellaggio Totale
          </div>
          <div className="text-xl font-black font-mono-tabular text-slate-900 mt-1">
            {analytics.totalTonnage.toLocaleString()} kg
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-indigo-600" /> Carico / RIR Medio
          </div>
          <div className="text-xl font-black font-mono-tabular text-slate-900 mt-1">
            {analytics.avgWeight}kg · {analytics.avgRir} RIR
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" /> Durata Media
          </div>
          <div className="text-xl font-black font-mono-tabular text-slate-900 mt-1">
            {analytics.avgDuration} min
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-purple-600" /> Freq. Settimanale
          </div>
          <div className="text-xl font-black font-mono-tabular text-slate-900 mt-1">
            {analytics.weeklyFrequency}x / sett
          </div>
        </div>
      </div>

      {/* Muscle Breakdown Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-4 py-2.5">Distretto Muscolare</th>
              <th className="px-4 py-2.5">Serie Lavoro</th>
              <th className="px-4 py-2.5">Tonnellaggio (kg)</th>
              <th className="px-4 py-2.5">Intensità Carico Media</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {analytics.muscleRows.map((row) => (
              <tr key={row.muscle}>
                <td className="px-4 py-2.5 font-bold text-slate-900">{row.muscle.replace('_', ' ')}</td>
                <td className="px-4 py-2.5 font-mono-tabular">{row.sets}</td>
                <td className="px-4 py-2.5 font-mono-tabular font-bold text-purple-700">
                  {row.tonnage.toLocaleString()} kg
                </td>
                <td className="px-4 py-2.5 font-mono-tabular">{row.loadIntensity} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resistance Profile Bias & Joint Type Pies */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Distribuzione Profilo Resistenza & Tipologia Articolare
          </h3>
          <div className="grid grid-cols-2 gap-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.profilePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`}
                >
                  {analytics.profilePieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.jointPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`}
                >
                  {analytics.jointPieData.map((_, i) => (
                    <Cell key={i} fill={JOINT_COLORS[i % JOINT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3-Phase Perceived Effort Trend */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Trend Sforzo Percepito (Pre / Durante / Post Sessione)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.effortTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Pre" stroke="#94A3B8" strokeWidth={2} />
                <Line type="monotone" dataKey="Durante" stroke="#6D28D9" strokeWidth={2.5} />
                <Line type="monotone" dataKey="Post" stroke="#F59E0B" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Average DOMS */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Media Mensile DOMS Mattutini per Distretto (Scala 1–10)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.domsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="muscle" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avgDoms" name="DOMS Medio" fill="#6D28D9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
