/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { calculate7DayMovingAverages, aggregateLogsByIsoWeek } from '../../services/bodybuildingLogic';
import { parseGarminFitFile, generateSampleGarminFitBinary, parseGarminFitBuffer } from '../../services/garminFitParser';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Flame,
  Footprints,
  Moon,
  Plus,
  Usb,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const AthleteDashboard: React.FC = () => {
  const {
    currentUser,
    dailyLogs,
    addDailyLog,
    importGarminFitActivity,
    theme,
  } = useApp();

  // Filter logs for this athlete
  const athleteLogs = dailyLogs
    .filter((l) => l.athlete_id === currentUser.id)
    .sort((a, b) => a.log_date.localeCompare(b.log_date));

  // Current weight & KPI calculations
  const latestLog = athleteLogs.length > 0 ? athleteLogs[athleteLogs.length - 1] : null;
  const currentWeight = latestLog && latestLog.weight_kg > 0 ? latestLog.weight_kg : currentUser.initial_weight_kg;
  const deltaTotal = Number((currentWeight - currentUser.initial_weight_kg).toFixed(2));
  const averages7d = calculate7DayMovingAverages(athleteLogs);
  const weeklyAggregations = aggregateLogsByIsoWeek(athleteLogs, 'DEFICIT', currentUser.experience_level);

  // Quick Log form states
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logWeight, setLogWeight] = useState('');
  const [logCalories, setLogCalories] = useState('');
  const [logSteps, setLogSteps] = useState('');
  const [logSleep, setLogSleep] = useState('8.0');
  const [logWorkout, setLogWorkout] = useState(true);
  const [logWaist, setLogWaist] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Garmin USB Importer states
  const [garminError, setGarminError] = useState<string | null>(null);
  const [garminSuccessMsg, setGarminSuccessMsg] = useState<string | null>(null);
  const [isParsingGarmin, setIsParsingGarmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDailyLog({
      athlete_id: currentUser.id,
      log_date: logDate,
      weight_kg: logWeight ? parseFloat(logWeight) : 0,
      calories_kcal: logCalories ? parseInt(logCalories, 10) : 0,
      steps: logSteps ? parseInt(logSteps, 10) : 0,
      sleep_hours: logSleep ? parseFloat(logSleep) : 8.0,
      workout_completed: logWorkout,
      waist_circ_cm: logWaist ? parseFloat(logWaist) : undefined,
      notes: logNotes || undefined,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleGarminFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGarminError(null);
    setGarminSuccessMsg(null);
    setIsParsingGarmin(true);

    try {
      const file = files[0];
      const result = await parseGarminFitFile(file);

      if (!result.valid || !result.parsedData) {
        setGarminError(result.error || 'Errore durante la decodifica del file Garmin .FIT');
        setIsParsingGarmin(false);
        return;
      }

      const p = result.parsedData;
      importGarminFitActivity({
        athlete_id: currentUser.id,
        activity_date: p.activityDate,
        file_name: p.fileName,
        file_size_bytes: p.fileSizeBytes,
        crc16_valid: p.crc16Valid,
        activity_type: p.activityType,
        duration_seconds: p.durationSeconds,
        active_calories: p.activeCalories,
        avg_heart_rate: p.avgHeartRate,
        max_heart_rate: p.maxHeartRate,
        total_steps: p.totalSteps,
      });

      setGarminSuccessMsg(
        `Attività ${p.fileName} importata con successo: ${Math.round(p.durationSeconds / 60)} min, ${p.activeCalories} kcal, FC media ${p.avgHeartRate} bpm. Flag allenamento aggiornato a SÌ!`
      );
    } catch {
      setGarminError('Errore durante la lettura del file binario.');
    } finally {
      setIsParsingGarmin(false);
    }
  };

  const handleGenerateSampleGarmin = () => {
    const today = new Date().toISOString().split('T')[0];
    const sampleBinary = generateSampleGarminFitBinary(today, {
      durationMinutes: 72,
      calories: 520,
      avgHr: 142,
      maxHr: 174,
      steps: 4100,
    });

    const parsed = parseGarminFitBuffer(sampleBinary.buffer, `garmin_usb_${today}.fit`);
    if (parsed.valid && parsed.parsedData) {
      const p = parsed.parsedData;
      importGarminFitActivity({
        athlete_id: currentUser.id,
        activity_date: p.activityDate,
        file_name: p.fileName,
        file_size_bytes: p.fileSizeBytes,
        crc16_valid: p.crc16Valid,
        activity_type: p.activityType,
        duration_seconds: p.durationSeconds,
        active_calories: p.activeCalories,
        avg_heart_rate: p.avgHeartRate,
        max_heart_rate: p.maxHeartRate,
        total_steps: p.totalSteps,
      });
      setGarminSuccessMsg(
        `Simulazione USB Garmin completata: generato file binario con Magic Bytes ".FIT" e CRC16 validato. ${p.activeCalories} kcal e ${p.durationSeconds / 60}m registrati!`
      );
    }
  };

  // Prepare chart dataset (with 7d moving average calculated for each point)
  const chartData = athleteLogs.map((log, index) => {
    const slice = athleteLogs.slice(Math.max(0, index - 6), index + 1);
    const validW = slice.filter((s) => s.weight_kg > 0).map((s) => s.weight_kg);
    const movingAvg = validW.length > 0 ? Number((validW.reduce((a, b) => a + b, 0) / validW.length).toFixed(2)) : null;

    return {
      date: log.log_date.slice(5), // MM-DD
      weight: log.weight_kg > 0 ? log.weight_kg : null,
      movingAvg,
      calories: log.calories_kcal > 0 ? log.calories_kcal : null,
      steps: log.steps > 0 ? log.steps : null,
      workout: log.workout_completed,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header KPI Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Dashboard Atleta
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {currentUser.full_name} · Monitoraggio Fisiologico
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Fase attiva: <span className="font-bold text-slate-900">Deficit Calorico Controllato</span> · Target: {currentUser.target_weight_kg} kg
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Peso Iniziale</span>
            <div className="text-xl font-black text-slate-900 font-mono-tabular">
              {currentUser.initial_weight_kg} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Peso Attuale</span>
            <div className="text-xl font-black text-slate-900 font-mono-tabular">
              {currentWeight} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Δ Peso Totale</span>
            <div className={`text-xl font-black font-mono-tabular flex items-center gap-1 ${
              deltaTotal <= 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {deltaTotal <= 0 ? <TrendingDown className="w-4 h-4 text-emerald-600" /> : <TrendingUp className="w-4 h-4 text-amber-600" />}
              {deltaTotal > 0 ? `+${deltaTotal}` : deltaTotal} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
          </div>

          <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200/80 shadow-sm">
            <span className="text-[11px] font-bold text-purple-900 block mb-1">Media 7gg Peso</span>
            <div className="text-xl font-black text-purple-950 font-mono-tabular">
              {averages7d.avgWeight} <span className="text-xs font-normal text-purple-700">kg</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Media 7gg Calorie</span>
            <div className="text-xl font-black text-slate-900 font-mono-tabular flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              {averages7d.avgCalories} <span className="text-xs font-normal text-slate-500">kcal</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Media 7gg Passi</span>
            <div className="text-xl font-black text-slate-900 font-mono-tabular flex items-center gap-1">
              <Footprints className="w-4 h-4 text-indigo-500" />
              {averages7d.avgSteps}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dual Panel: Quick Log Giornaliero & Garmin .FIT USB Importer */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Quick Log Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Plus className="w-4 h-4 text-purple-700" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Quick Log Giornaliero</h2>
            </div>
            <span className="text-xs text-slate-500">Compilazione rapida</span>
          </div>

          {saveSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Log salvato! Le medie mobili e i grafici sono stati aggiornati istantaneamente.</span>
            </div>
          )}

          <form onSubmit={handleQuickLogSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Peso Mattutino (kg)</label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="es. 81.4"
                  value={logWeight}
                  onChange={(e) => setLogWeight(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Calorie (kcal)</label>
                <input
                  type="number"
                  placeholder="es. 2300"
                  value={logCalories}
                  onChange={(e) => setLogCalories(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passi Giornalieri</label>
                <input
                  type="number"
                  placeholder="es. 11000"
                  value={logSteps}
                  onChange={(e) => setLogSteps(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sonno (ore)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="8.0"
                  value={logSleep}
                  onChange={(e) => setLogSleep(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Circonferenza Vita (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="es. 82.5"
                  value={logWaist}
                  onChange={(e) => setLogWaist(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Allenamento Svolto?</label>
                <button
                  type="button"
                  onClick={() => setLogWorkout(!logWorkout)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                    logWorkout
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-100 border-slate-300 text-slate-600'
                  }`}
                >
                  {logWorkout ? 'SÌ, Allenamento Fatto' : 'NO, Giorno Riposo'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Note Fisiologiche Rapide</label>
              <input
                type="text"
                placeholder="es. Sensazione di pienezza muscolare, fame bassa..."
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              style={{ backgroundColor: theme.accent_primary }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Salva Log Giornaliero
            </button>
          </form>
        </div>

        {/* Garmin USB Sync (.FIT Native Parser) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Usb className="w-4 h-4 text-indigo-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Sync Garmin USB (.FIT Nativo)</h2>
                  <div className="text-[11px] text-slate-500">
                    Directory: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-800">/GARMIN/Activity/</code>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Magic Bytes .FIT
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Collega il tuo dispositivo Garmin via cavo USB al computer (modalità Mass Storage). Trascina o seleziona direttamente i file <span className="font-semibold text-slate-900">.fit</span> per estrarre frequenza cardiaca, calorie e impostare automaticamente l'allenamento.
            </p>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-xl p-6 text-center cursor-pointer transition-colors mb-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".fit"
                onChange={(e) => handleGarminFileUpload(e.target.files)}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">
                Trascina qui il file .fit o clicca per sfogliare
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Verifica automatica Magic Bytes (.FIT nei byte 8-11 + CRC16)
              </div>
            </div>

            {garminError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{garminError}</span>
              </div>
            )}

            {garminSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{garminSuccessMsg}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleGenerateSampleGarmin}
              disabled={isParsingGarmin}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              Testa con File .FIT Reale Simulato
            </button>
            <span className="text-[11px] text-slate-400">Dimensione max: 25MB</span>
          </div>
        </div>
      </div>

      {/* 3. Grafici Multi-Annuali & Curve Fisiologiche */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Curva Peso Giornaliero + Media Mobile 7gg */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Curva Peso & Media Mobile 7gg</h2>
              <p className="text-xs text-slate-500">
                La media mobile 7gg smorza la ritenzione idrica e mostra la reale perdita di tessuto
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Peso Singolo
              </span>
              <span className="flex items-center gap-1 font-semibold text-purple-700">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-700" /> Media 7gg
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: '#94a3b8' }}
                  name="Peso Mattutino (kg)"
                />
                <Line
                  type="monotone"
                  dataKey="movingAvg"
                  stroke="#6d28d9"
                  strokeWidth={3}
                  dot={false}
                  name="Media Mobile 7gg (kg)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Istogramma Calorie e Passi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ciclizzazione Calorie & Spesa Energetica</h2>
              <p className="text-xs text-slate-500">
                Distribuzione giorni ON (Ricarica) vs OFF con target calorico
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-semibold text-orange-600">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Kcal
              </span>
              <span className="flex items-center gap-1 font-semibold text-indigo-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Passi
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="cal" domain={[1500, 3500]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar yAxisId="cal" dataKey="calories" fill="#f97316" radius={[4, 4, 0, 0]} name="Calorie (kcal)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Tabella Storica Aggregata per Settimana ISO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Riepilogo Storico per Settimana ISO</h2>
            <p className="text-xs text-slate-500">
              Aggregazione aritmetica dei log giornalieri secondo le formule di Francesco Pavone
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
            v_weekly_athlete_summary
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Settimana ISO</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Media Peso (kg)</th>
                <th className="px-4 py-3">Δ Settimanale</th>
                <th className="px-4 py-3">Media Calorie</th>
                <th className="px-4 py-3">Media Passi</th>
                <th className="px-4 py-3">Allenamenti</th>
                <th className="px-4 py-3">Valutazione Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeklyAggregations.map((w) => (
                <tr key={w.isoWeek} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-bold text-purple-900 font-mono-tabular">
                    {w.isoWeek}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {w.startDate} → {w.endDate}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 font-mono-tabular">
                    {w.avgWeightKg} kg
                  </td>
                  <td className="px-4 py-3 font-mono-tabular">
                    {w.deltaWeightKg !== undefined ? (
                      <span className={`font-semibold ${w.deltaWeightKg <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {w.deltaWeightKg > 0 ? `+${w.deltaWeightKg}` : w.deltaWeightKg} kg ({w.deltaWeightPct}%)
                      </span>
                    ) : (
                      <span className="text-slate-400">Baseline</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-mono-tabular">
                    {w.avgCaloriesKcal} kcal
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-mono-tabular">
                    {w.avgSteps}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {w.totalWorkouts} sessioni
                  </td>
                  <td className="px-4 py-3">
                    {w.benchmarkFeedback ? (
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        w.benchmarkStatus === 'OPTIMAL'
                          ? 'bg-emerald-50 text-emerald-800'
                          : w.benchmarkStatus === 'BELOW_TARGET'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-800'
                      }`}>
                        {w.benchmarkFeedback}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Periodo di avvio</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
