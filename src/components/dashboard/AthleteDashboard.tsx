/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { aggregateLogsByIsoWeek } from '../../services/bodybuildingLogic';
import { parseAthleteExcelFile, generateAthleteExcelTemplate } from '../../services/excelImporter';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Flame,
  Footprints,
  Moon,
  Plus,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Sparkles,
  Edit2,
  Check,
  X,
  Dumbbell,
  Trophy,
  Sun,
  BookOpen,
  Bell,
  ArrowRight,
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
  ReferenceLine,
  Cell,
} from 'recharts';
import { MacrocycleWeightVolumeChart } from './MacrocycleWeightVolumeChart';

export const AthleteDashboard: React.FC = () => {
  const {
    currentUser,
    dailyLogs,
    addDailyLog,
    bulkImportDailyLogs,
    setCurrentRoute,
    stepStreak,
    gamificationRecords,
    satietyLogs,
    dripModules,
    setIsMorningDomsModalOpen,
    setIsMorningBriefingOpen,
    setIsEndOfDayModalOpen,
    setIsDripModalOpen,
    theme,
  } = useApp();

  // Filter logs for this athlete sorted chronologically
  const athleteLogs = useMemo(() => {
    return dailyLogs
      .filter((l) => l.athlete_id === currentUser.id)
      .sort((a, b) => a.log_date.localeCompare(b.log_date));
  }, [dailyLogs, currentUser.id]);

  // Extract all valid logs with weight > 0
  const validWeightLogs = useMemo(() => {
    return athleteLogs.filter((l) => l.weight_kg > 0);
  }, [athleteLogs]);

  // Compute calculated metrics
  const autoInitialWeight = validWeightLogs.length > 0 
    ? validWeightLogs[0].weight_kg 
    : currentUser.initial_weight_kg;

  const autoCurrentWeight = validWeightLogs.length > 0 
    ? validWeightLogs[validWeightLogs.length - 1].weight_kg 
    : currentUser.initial_weight_kg;

  // Recent 7 available entries (even if historical)
  const recentLogs = useMemo(() => {
    return [...athleteLogs].slice(-7);
  }, [athleteLogs]);

  const autoAvgWeight = useMemo(() => {
    const weights = recentLogs.filter((l) => l.weight_kg > 0).map((l) => l.weight_kg);
    return weights.length > 0
      ? Number((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(2))
      : autoCurrentWeight;
  }, [recentLogs, autoCurrentWeight]);

  const autoAvgCalories = useMemo(() => {
    const calories = recentLogs.filter((l) => l.calories_kcal > 0).map((l) => l.calories_kcal);
    return calories.length > 0
      ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length)
      : 2300;
  }, [recentLogs]);

  const autoAvgSteps = useMemo(() => {
    const steps = recentLogs.filter((l) => l.steps > 0).map((l) => l.steps);
    return steps.length > 0
      ? Math.round(steps.reduce((a, b) => a + b, 0) / steps.length)
      : 11000;
  }, [recentLogs]);

  const autoAvgSleep = useMemo(() => {
    const sleep = recentLogs.filter((l) => l.sleep_hours > 0).map((l) => l.sleep_hours);
    return sleep.length > 0
      ? Number((sleep.reduce((a, b) => a + b, 0) / sleep.length).toFixed(1))
      : 8.0;
  }, [recentLogs]);

  // State for user overrides on KPI cards (direct inline editing)
  const [manualInitialWeight, setManualInitialWeight] = useState<number | null>(null);
  const [manualCurrentWeight, setManualCurrentWeight] = useState<number | null>(null);
  const [manualAvgWeight, setManualAvgWeight] = useState<number | null>(null);
  const [manualAvgCalories, setManualAvgCalories] = useState<number | null>(null);
  const [manualAvgSteps, setManualAvgSteps] = useState<number | null>(null);
  const [manualAvgSleep, setManualAvgSleep] = useState<number | null>(null);

  // Active edit card state
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editTempValue, setEditTempValue] = useState('');

  // Resolved active display values
  const displayInitialWeight = manualInitialWeight !== null ? manualInitialWeight : autoInitialWeight;
  const displayCurrentWeight = manualCurrentWeight !== null ? manualCurrentWeight : autoCurrentWeight;
  const displayDeltaTotal = Number((displayCurrentWeight - displayInitialWeight).toFixed(2));
  const displayAvgWeight = manualAvgWeight !== null ? manualAvgWeight : autoAvgWeight;
  const displayAvgCalories = manualAvgCalories !== null ? manualAvgCalories : autoAvgCalories;
  const displayAvgSteps = manualAvgSteps !== null ? manualAvgSteps : autoAvgSteps;
  const displayAvgSleep = manualAvgSleep !== null ? manualAvgSleep : autoAvgSleep;

  const weeklyAggregations = useMemo(() => {
    return aggregateLogsByIsoWeek(athleteLogs, 'DEFICIT', currentUser.experience_level);
  }, [athleteLogs, currentUser.experience_level]);

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

  // Excel Importer states
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [excelSuccessMsg, setExcelSuccessMsg] = useState<string | null>(null);
  const [excelError, setExcelError] = useState<string | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const pendingSatietyCount = satietyLogs.filter(
    (s) => s.athlete_id === currentUser.id && s.post_meal_satiety === undefined
  ).length;
  const latestPr = gamificationRecords.find((r) => r.athlete_id === currentUser.id);
  const stepsRemaining = Math.max(0, stepStreak.daily_target_steps - stepStreak.today_steps);
  const completedDrips = dripModules.filter((m) => m.completed_by_athlete_ids.includes(currentUser.id)).length;

  const startEditingCard = (cardKey: string, currentValue: number) => {
    setEditingCard(cardKey);
    setEditTempValue(String(currentValue));
  };

  const saveEditingCard = (cardKey: string) => {
    const val = parseFloat(editTempValue);
    if (!isNaN(val)) {
      if (cardKey === 'initialWeight') setManualInitialWeight(val);
      if (cardKey === 'currentWeight') {
        setManualCurrentWeight(val);
        // Also save to today's log so it becomes persistent in dailyLogs
        const todayStr = new Date().toISOString().split('T')[0];
        addDailyLog({
          athlete_id: currentUser.id,
          log_date: todayStr,
          weight_kg: val,
          calories_kcal: displayAvgCalories,
          steps: displayAvgSteps,
          sleep_hours: displayAvgSleep,
          workout_completed: true,
        });
      }
      if (cardKey === 'avgWeight') setManualAvgWeight(val);
      if (cardKey === 'avgCalories') setManualAvgCalories(Math.round(val));
      if (cardKey === 'avgSteps') setManualAvgSteps(Math.round(val));
      if (cardKey === 'avgSleep') setManualAvgSleep(Number(val.toFixed(1)));
    }
    setEditingCard(null);
  };

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightVal = logWeight ? parseFloat(logWeight) : displayCurrentWeight;
    addDailyLog({
      athlete_id: currentUser.id,
      log_date: logDate,
      weight_kg: weightVal,
      calories_kcal: logCalories ? parseInt(logCalories, 10) : displayAvgCalories,
      steps: logSteps ? parseInt(logSteps, 10) : displayAvgSteps,
      sleep_hours: logSleep ? parseFloat(logSleep) : 8.0,
      workout_completed: logWorkout,
      waist_circ_cm: logWaist ? parseFloat(logWaist) : undefined,
      notes: logNotes || undefined,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExcelUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setExcelError(null);
    setExcelSuccessMsg(null);
    setIsParsingExcel(true);

    try {
      const file = files[0];
      const summary = await parseAthleteExcelFile(file, currentUser.id);

      if (summary.importedLogs.length === 0) {
        setExcelError(summary.errors[0] || 'Nessuna riga valida trovata nel file Excel.');
        setIsParsingExcel(false);
        return;
      }

      // Reset manual overrides so auto-calculated values take over from Excel
      setManualInitialWeight(null);
      setManualCurrentWeight(null);
      setManualAvgWeight(null);
      setManualAvgCalories(null);
      setManualAvgSteps(null);
      setManualAvgSleep(null);

      const { importedCount, updatedCount } = bulkImportDailyLogs(summary.importedLogs);
      setExcelSuccessMsg(
        `Importati ${importedCount} nuovi log e aggiornati ${updatedCount} giorni dal file ${summary.fileName} (${summary.dateRange.start} → ${summary.dateRange.end}). KPI ricalcolati istantaneamente!`
      );
    } catch {
      setExcelError('Errore durante la lettura del file Excel/CSV. Verifica che il formato sia corretto.');
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleLoadDemoExcel = () => {
    const demoLogs = [
      { id: 'demo-1', athlete_id: currentUser.id, log_date: '2026-03-01', weight_kg: 83.2, calories_kcal: 2300, steps: 11000, sleep_hours: 8.0, workout_completed: true, waist_circ_cm: 84.0, notes: 'Inizio blocco Tensione - Spinta A' },
      { id: 'demo-2', athlete_id: currentUser.id, log_date: '2026-03-02', weight_kg: 82.8, calories_kcal: 2300, steps: 10500, sleep_hours: 7.5, workout_completed: true, waist_circ_cm: 83.8, notes: 'Trazione A - Panca e stacco stabili' },
      { id: 'demo-3', athlete_id: currentUser.id, log_date: '2026-03-03', weight_kg: 82.5, calories_kcal: 2300, steps: 12000, sleep_hours: 8.2, workout_completed: false, waist_circ_cm: 83.6, notes: 'Giorno OFF - Camminata' },
      { id: 'demo-4', athlete_id: currentUser.id, log_date: '2026-03-04', weight_kg: 82.3, calories_kcal: 2300, steps: 11500, sleep_hours: 7.8, workout_completed: true, waist_circ_cm: 83.5, notes: 'Gambe A - Hack Squat profondo' },
      { id: 'demo-5', athlete_id: currentUser.id, log_date: '2026-03-05', weight_kg: 82.0, calories_kcal: 2300, steps: 10800, sleep_hours: 8.0, workout_completed: true, waist_circ_cm: 83.2, notes: 'Upper B - Deltoidi e braccia' },
      { id: 'demo-6', athlete_id: currentUser.id, log_date: '2026-03-06', weight_kg: 81.8, calories_kcal: 2300, steps: 10200, sleep_hours: 8.5, workout_completed: false, waist_circ_cm: 83.0, notes: 'Giorno OFF - Sauna' },
      { id: 'demo-7', athlete_id: currentUser.id, log_date: '2026-03-07', weight_kg: 81.5, calories_kcal: 3100, steps: 11200, sleep_hours: 8.0, workout_completed: true, waist_circ_cm: 82.8, notes: 'Ricarica High Carb (450g Cho)' },
      { id: 'demo-8', athlete_id: currentUser.id, log_date: '2026-03-08', weight_kg: 81.6, calories_kcal: 2250, steps: 11400, sleep_hours: 7.8, workout_completed: true, waist_circ_cm: 82.7, notes: 'Spinta A post ricarica - Pienezza' },
      { id: 'demo-9', athlete_id: currentUser.id, log_date: '2026-03-09', weight_kg: 81.3, calories_kcal: 2250, steps: 10900, sleep_hours: 8.0, workout_completed: true, waist_circ_cm: 82.5, notes: 'Trazione A' },
      { id: 'demo-10', athlete_id: currentUser.id, log_date: '2026-03-10', weight_kg: 81.2, calories_kcal: 2250, steps: 11800, sleep_hours: 8.2, workout_completed: false, waist_circ_cm: 82.4, notes: 'Giorno OFF - Monitoraggio Passi & Sonno' },
    ];

    setManualInitialWeight(null);
    setManualCurrentWeight(null);
    setManualAvgWeight(null);
    setManualAvgCalories(null);
    setManualAvgSteps(null);
    setManualAvgSleep(null);

    const { importedCount, updatedCount } = bulkImportDailyLogs(demoLogs);
    setExcelSuccessMsg(
      `Foglio Luca Puci caricato: ${importedCount} log creati, ${updatedCount} aggiornati. Peso iniziale: 83.2kg, attuale: 81.2kg, sonno medio: 8.0h!`
    );
  };


  // Prepare chart dataset
  const chartData = useMemo(() => {
    return athleteLogs.map((log, index) => {
      const slice = athleteLogs.slice(Math.max(0, index - 6), index + 1);
      const validW = slice.filter((s) => s.weight_kg > 0).map((s) => s.weight_kg);
      const movingAvg = validW.length > 0 ? Number((validW.reduce((a, b) => a + b, 0) / validW.length).toFixed(2)) : null;

      return {
        date: log.log_date.slice(5),
        weight: log.weight_kg > 0 ? log.weight_kg : null,
        movingAvg,
        calories: log.calories_kcal > 0 ? log.calories_kcal : null,
        steps: log.steps > 0 ? log.steps : null,
        sleep: log.sleep_hours > 0 ? log.sleep_hours : null,
        workout: log.workout_completed,
      };
    });
  }, [athleteLogs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 space-y-8">
      {/* 1. Header & Live Editable KPI Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              <span>Dashboard Fisiologica Atleta</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">Campi editabili in-place con 1 clic</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {currentUser.full_name} · Monitoraggio Dati & Telemetria
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Fase attiva: <span className="font-bold text-slate-900">Deficit Calorico Controllato</span> · Target: {currentUser.target_weight_kg} kg
          </div>
        </div>

        {/* 7 KPI Cards (Including Sleep & In-Place Direct Editing) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {/* Card 1: Peso Iniziale (oldest entry from Excel / log) */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peso Iniziale</span>
              <button
                onClick={() => startEditingCard('initialWeight', displayInitialWeight)}
                className="text-slate-300 hover:text-purple-700 p-0.5 transition-colors"
                title="Modifica valore iniziale"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>

            {editingCard === 'initialWeight' ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="0.1"
                  autoFocus
                  value={editTempValue}
                  onChange={(e) => setEditTempValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditingCard('initialWeight')}
                  className="w-16 px-1 py-0.5 text-xs font-bold font-mono-tabular border border-purple-500 rounded bg-purple-50"
                />
                <button
                  onClick={() => saveEditingCard('initialWeight')}
                  className="p-1 text-emerald-600 hover:text-emerald-700"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingCard(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => startEditingCard('initialWeight', displayInitialWeight)}
                className="cursor-pointer"
              >
                <div className="text-xl font-black text-slate-900 font-mono-tabular">
                  {displayInitialWeight} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">Dal 1° log rilevato</span>
              </div>
            )}
          </div>

          {/* Card 2: Peso Attuale (most recent entry) */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peso Attuale</span>
              <button
                onClick={() => startEditingCard('currentWeight', displayCurrentWeight)}
                className="text-slate-300 hover:text-purple-700 p-0.5 transition-colors"
                title="Modifica peso attuale"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>

            {editingCard === 'currentWeight' ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="0.1"
                  autoFocus
                  value={editTempValue}
                  onChange={(e) => setEditTempValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditingCard('currentWeight')}
                  className="w-16 px-1 py-0.5 text-xs font-bold font-mono-tabular border border-purple-500 rounded bg-purple-50"
                />
                <button
                  onClick={() => saveEditingCard('currentWeight')}
                  className="p-1 text-emerald-600 hover:text-emerald-700"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingCard(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => startEditingCard('currentWeight', displayCurrentWeight)}
                className="cursor-pointer"
              >
                <div className="text-xl font-black text-slate-900 font-mono-tabular">
                  {displayCurrentWeight} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">Ultimo peso registrato</span>
              </div>
            )}
          </div>

          {/* Card 3: Delta Totale (recomputed dynamically) */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Δ Peso Totale</span>
            <div className={`text-xl font-black font-mono-tabular flex items-center gap-1 ${
              displayDeltaTotal <= 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {displayDeltaTotal <= 0 ? <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" /> : <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />}
              <span>{displayDeltaTotal > 0 ? `+${displayDeltaTotal}` : displayDeltaTotal}</span>
              <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              {displayDeltaTotal <= 0 ? 'Progresso in deficit' : 'Incremento ponderale'}
            </span>
          </div>

          {/* Card 4: Media 7gg Peso */}
          <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 shadow-xs relative group hover:border-purple-400 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Media 7gg Peso</span>
              <button
                onClick={() => startEditingCard('avgWeight', displayAvgWeight)}
                className="text-purple-300 hover:text-purple-900 p-0.5 transition-colors"
                title="Modifica media 7gg peso"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>

            {editingCard === 'avgWeight' ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="0.05"
                  autoFocus
                  value={editTempValue}
                  onChange={(e) => setEditTempValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditingCard('avgWeight')}
                  className="w-16 px-1 py-0.5 text-xs font-bold font-mono-tabular border border-purple-600 rounded bg-white text-purple-950"
                />
                <button onClick={() => saveEditingCard('avgWeight')} className="p-1 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingCard(null)} className="p-1 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div onClick={() => startEditingCard('avgWeight', displayAvgWeight)} className="cursor-pointer">
                <div className="text-xl font-black text-purple-950 font-mono-tabular">
                  {displayAvgWeight} <span className="text-xs font-normal text-purple-700">kg</span>
                </div>
                <span className="text-[10px] text-purple-700 block truncate">Media mobile smorzata</span>
              </div>
            )}
          </div>

          {/* Card 5: Media 7gg Kcal */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Media 7gg Kcal</span>
              <button
                onClick={() => startEditingCard('avgCalories', displayAvgCalories)}
                className="text-slate-300 hover:text-orange-600 p-0.5 transition-colors"
                title="Modifica media calorie"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>

            {editingCard === 'avgCalories' ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  autoFocus
                  value={editTempValue}
                  onChange={(e) => setEditTempValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditingCard('avgCalories')}
                  className="w-16 px-1 py-0.5 text-xs font-bold font-mono-tabular border border-orange-500 rounded bg-orange-50"
                />
                <button onClick={() => saveEditingCard('avgCalories')} className="p-1 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingCard(null)} className="p-1 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div onClick={() => startEditingCard('avgCalories', displayAvgCalories)} className="cursor-pointer">
                <div className="text-xl font-black text-slate-900 font-mono-tabular flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>{displayAvgCalories}</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">Introito medio</span>
              </div>
            )}
          </div>

          {/* Card 6: Media 7gg Passi */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Media 7gg Passi</span>
              <button
                onClick={() => startEditingCard('avgSteps', displayAvgSteps)}
                className="text-slate-300 hover:text-indigo-600 p-0.5 transition-colors"
                title="Modifica media passi"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>

            {editingCard === 'avgSteps' ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  autoFocus
                  value={editTempValue}
                  onChange={(e) => setEditTempValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditingCard('avgSteps')}
                  className="w-16 px-1 py-0.5 text-xs font-bold font-mono-tabular border border-indigo-500 rounded bg-indigo-50"
                />
                <button onClick={() => saveEditingCard('avgSteps')} className="p-1 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingCard(null)} className="p-1 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div onClick={() => startEditingCard('avgSteps', displayAvgSteps)} className="cursor-pointer">
                <div className="text-xl font-black text-slate-900 font-mono-tabular flex items-center gap-1">
                  <Footprints className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{displayAvgSteps}</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">Spesa NEAT attiva</span>
              </div>
            )}
          </div>

          {/* Card 7: Media 7gg Sonno (RICHIESTA SPECIFICA UTENTE) */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Media 7gg Sonno</span>
              <button
                onClick={() => startEditingCard('avgSleep', displayAvgSleep)}
                className="text-slate-300 hover:text-blue-600 p-0.5 transition-colors"
                title="Modifica ore di sonno"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>

            {editingCard === 'avgSleep' ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="0.1"
                  autoFocus
                  value={editTempValue}
                  onChange={(e) => setEditTempValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditingCard('avgSleep')}
                  className="w-14 px-1 py-0.5 text-xs font-bold font-mono-tabular border border-blue-500 rounded bg-blue-50"
                />
                <button onClick={() => saveEditingCard('avgSleep')} className="p-1 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingCard(null)} className="p-1 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div onClick={() => startEditingCard('avgSleep', displayAvgSleep)} className="cursor-pointer">
                <div className="text-xl font-black text-slate-900 font-mono-tabular flex items-center gap-1">
                  <Moon className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{displayAvgSleep}</span>
                  <span className="text-xs font-normal text-slate-400">ore</span>
                </div>
                <span className={`text-[10px] font-bold block truncate ${
                  displayAvgSleep >= 7.5 ? 'text-emerald-600' : displayAvgSleep >= 6.5 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {displayAvgSleep >= 7.5 ? 'Recupero Ottimale' : displayAvgSleep >= 6.5 ? 'Sufficiente' : 'Debito di Sonno'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Triplet Input Section: Quick Log, Excel Importer & Garmin USB */}
      <div className="grid lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Quick Log Giornaliero */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-purple-700" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Quick Log Singolo</h2>
              </div>
              <span className="text-[11px] text-slate-400">Manuale</span>
            </div>

            {saveSuccess && (
              <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Log salvato! Medie aggiornate.</span>
              </div>
            )}

            <form onSubmit={handleQuickLogSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Data</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="es. 81.4"
                    value={logWeight}
                    onChange={(e) => setLogWeight(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Kcal</label>
                  <input
                    type="number"
                    placeholder="2300"
                    value={logCalories}
                    onChange={(e) => setLogCalories(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Passi</label>
                  <input
                    type="number"
                    placeholder="11000"
                    value={logSteps}
                    onChange={(e) => setLogSteps(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Sonno (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="8.0"
                    value={logSleep}
                    onChange={(e) => setLogSleep(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Vita (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="82.5"
                    value={logWaist}
                    onChange={(e) => setLogWaist(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Allenamento?</label>
                  <button
                    type="button"
                    onClick={() => setLogWorkout(!logWorkout)}
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                      logWorkout ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  >
                    {logWorkout ? 'SÌ, Allenato' : 'NO, Riposo'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg text-white font-bold text-xs shadow-sm hover:opacity-95"
                style={{ backgroundColor: theme.accent_primary }}
              >
                Salva Record Singolo
              </button>
            </form>
          </div>
        </div>

        {/* Card 2: Importa da Excel / CSV */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Import Excel / CSV</h2>
                  <div className="text-[10px] text-slate-400">Aggiornamento automatico KPI in alto</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                .XLSX / .CSV
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Trascina il foglio con peso, calorie, passi e sonno. Il peso iniziale e attuale si aggiornano all'istante insieme alle medie 7gg.
            </p>

            {/* Dropzone Excel */}
            <div
              onClick={() => excelInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 rounded-xl p-4 text-center cursor-pointer transition-colors mb-3"
            >
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => handleExcelUpload(e.target.files)}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs font-bold text-slate-800">
                Trascina qui il file Excel o clicca
              </div>
              <div className="text-[10px] text-slate-500">Decodifica automatica delle colonne e delle date</div>
            </div>

            {excelError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-center gap-2 mb-3">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>{excelError}</span>
              </div>
            )}

            {excelSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{excelSuccessMsg}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={handleLoadDemoExcel}
              disabled={isParsingExcel}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Carica Demo Foglio Luca Puci
            </button>
            <button
              onClick={generateAthleteExcelTemplate}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1"
              title="Scarica template vuoto pronto per compilazione"
            >
              <Download className="w-3 h-3" /> Template
            </button>
          </div>
        </div>

        {/* Card 3: Mobile Engagement Hub, PR Streaks & DOMS */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hub Allenamento & Routine</h2>
                  <div className="text-[10px] text-slate-400">Streak, DOMS, Sazietà & Moduli Drip</div>
                </div>
              </div>
              <span className="text-[11px] font-bold font-mono-tabular text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Streak {stepStreak.current_streak_days}gg
              </span>
            </div>

            {/* Afternoon Step Reminder if incomplete */}
            <div className={`p-3 rounded-xl border text-xs ${stepsRemaining > 0 ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'}`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5" />
                  {stepsRemaining > 0 ? 'Promemoria Passi Pomeridiano' : 'Obiettivo Passi Raggiunto'}
                </span>
                <span className="font-mono-tabular">
                  {stepStreak.today_steps.toLocaleString()} / {stepStreak.daily_target_steps.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stepsRemaining > 0 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                  style={{ width: `${Math.min(100, Math.round((stepStreak.today_steps / stepStreak.daily_target_steps) * 100))}%` }}
                />
              </div>
              {stepsRemaining > 0 && (
                <p className="text-[11px] mt-1 text-amber-800">
                  Mancano <strong className="font-mono-tabular">{stepsRemaining.toLocaleString()}</strong> passi per mantenere lo streak consecutivo!
                </p>
              )}
            </div>

            {/* Latest PR or Pending Satiety prompt */}
            {latestPr && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-700 block">Ultimo Record Storico</span>
                  <span className="font-bold text-slate-900">{latestPr.exercise_name}</span>
                </div>
                <span className="font-black font-mono-tabular text-purple-800">
                  {latestPr.value} {latestPr.unit}
                </span>
              </div>
            )}

            {pendingSatietyCount > 0 && (
              <button
                type="button"
                onClick={() => setCurrentRoute('/app/nutrition')}
                className="w-full p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Bell className="w-3.5 h-3.5 text-indigo-700" />
                  Check Sazietà +60 min in sospeso ({pendingSatietyCount})
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentRoute('/app/workouts')}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
              Workout Logger
            </button>
            <button
              type="button"
              onClick={() => setIsMorningDomsModalOpen(true)}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 border border-purple-200 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-purple-700" />
              Check DOMS
            </button>
            <button
              type="button"
              onClick={() => setIsMorningBriefingOpen(true)}
              className="min-h-[44px] px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Briefing Mattina
            </button>
            <button
              type="button"
              onClick={() => setIsEndOfDayModalOpen(true)}
              className="min-h-[44px] px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              Checklist Sera
            </button>
            <button
              type="button"
              onClick={() => setIsDripModalOpen(true)}
              className="col-span-2 min-h-[44px] px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 font-bold text-[11px] flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                Corsi & Drip Educativi ({completedDrips}/{dripModules.length})
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. I TRE GRAFICI SULLA STESSA LINEA (Peso, Calorie, Sonno) - RICHIESTA SPECIFICA UTENTE */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-700" />
            Analisi Telemetrica Integrata: Peso, Nutrizione e Sonno
          </h2>
          <p className="text-xs text-slate-500">
            Monitoraggio correlato tra deficit calorico, recupero neurale notturno e smorzamento delle fluttuazioni idriche
          </p>
        </div>

        {/* 3 Charts in 1 Line on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grafico 1: Curva Peso & Media Mobile 7gg */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">1. Peso & Media Mobile 7gg</h3>
                <p className="text-[11px] text-slate-400">Filtraggio ritenzione idrica</p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Singolo
                </span>
                <span className="flex items-center gap-1 font-bold text-purple-700">
                  <span className="w-2 h-2 rounded-full bg-purple-700" /> Media 7gg
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#cbd5e1"
                    strokeWidth={1.5}
                    dot={{ r: 2.5, fill: '#94a3b8' }}
                    name="Peso (kg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="movingAvg"
                    stroke="#6d28d9"
                    strokeWidth={2.5}
                    dot={false}
                    name="Media 7gg (kg)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 text-center font-mono-tabular">
              Delta: <span className="font-bold text-slate-900">{displayDeltaTotal} kg</span> · Media attuale: <span className="font-bold text-purple-900">{displayAvgWeight} kg</span>
            </div>
          </div>

          {/* Grafico 2: Ciclizzazione Calorie (Kcal) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">2. Ciclizzazione Calorie (Kcal)</h3>
                <p className="text-[11px] text-slate-400">Giorni ON vs OFF & Ricarica</p>
              </div>
              <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" /> Introito
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[1500, 3500]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <ReferenceLine y={2300} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Target ON', fill: '#ea580c', fontSize: 9 }} />
                  <Bar dataKey="calories" fill="#f97316" radius={[4, 4, 0, 0]} name="Calorie (kcal)">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.calories && entry.calories > 2800 ? '#7c3aed' : '#f97316'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 text-center font-mono-tabular">
              Media calorie 7gg: <span className="font-bold text-orange-600">{displayAvgCalories} kcal</span>
            </div>
          </div>

          {/* Grafico 3: Analisi Sonno & Recupero Notturno (RICHIESTA SPECIFICA UTENTE) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">3. Analisi Sonno & Recupero</h3>
                <p className="text-[11px] text-slate-400">Ore/notte e ritmo circadiano</p>
              </div>
              <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                <Moon className="w-3 h-3 text-blue-500" /> Target 8h
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[4, 12]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    formatter={(value: any) => [`${value} ore`, 'Durata Sonno']}
                  />
                  <ReferenceLine y={8.0} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: '8.0h Opt.', fill: '#2563eb', fontSize: 9 }} />
                  <Bar dataKey="sleep" radius={[4, 4, 0, 0]} name="Sonno (ore)">
                    {chartData.map((entry, index) => {
                      const val = entry.sleep || 8;
                      const barColor = val >= 7.5 ? '#10b981' : val >= 6.5 ? '#f59e0b' : '#ef4444';
                      return <Cell key={`sleep-cell-${index}`} fill={barColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 text-center font-mono-tabular">
              Media sonno 7gg: <span className="font-bold text-blue-600">{displayAvgSleep} ore/notte</span> ({displayAvgSleep >= 7.5 ? 'Ottimale' : 'Da monitorare'})
            </div>
          </div>
        </div>

      </div>

      {/* 3b. Curva Peso Corporeo & Volume di Allenamento nel Macrociclo */}
      <MacrocycleWeightVolumeChart
        initialWeightKg={displayInitialWeight}
        currentWeightKg={displayCurrentWeight}
      />

      {/* 4. Tabella Storica Aggregata ISO (Mobile Optimized UI/UX) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Riepilogo Storico per Settimana ISO</h2>
            <p className="text-xs text-slate-500">
              Formule fisiologiche automatiche conformi alla vista SQL <code>v_weekly_athlete_summary</code>
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-900 rounded-md self-start sm:self-auto">
            {weeklyAggregations.length} Settimane Elaborate
          </span>
        </div>

        {/* Mobile View: Cards layout to prevent squished tables */}
        <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-4">
          {weeklyAggregations.map((w) => (
            <div key={w.isoWeek} className="pt-3 first:pt-0 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-purple-950 font-mono-tabular text-sm">
                  {w.isoWeek}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {w.startDate} → {w.endDate}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-500 block">Media Peso 7gg:</span>
                  <span className="font-black text-slate-900 font-mono-tabular text-sm">
                    {w.avgWeightKg} kg
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Variazione Δ:</span>
                  {w.deltaWeightKg !== undefined ? (
                    <span className={`font-black font-mono-tabular text-sm ${w.deltaWeightKg <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {w.deltaWeightKg > 0 ? `+${w.deltaWeightKg}` : w.deltaWeightKg} kg ({w.deltaWeightPct}%)
                    </span>
                  ) : (
                    <span className="text-slate-400">Baseline</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Calorie Medie:</span>
                  <span className="font-bold text-slate-800 font-mono-tabular">
                    {w.avgCaloriesKcal} kcal
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Sonno Medio:</span>
                  <span className="font-bold text-blue-900 font-mono-tabular">
                    {w.avgSleepHours || 8.0} h/notte
                  </span>
                </div>
              </div>

              {w.benchmarkFeedback && (
                <div className={`p-2 rounded-lg text-[11px] font-medium ${
                  w.benchmarkStatus === 'OPTIMAL'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {w.benchmarkFeedback}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table with Tabular Numerals */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Settimana ISO</th>
                <th className="px-4 py-3">Intervallo Date</th>
                <th className="px-4 py-3">Media Peso (kg)</th>
                <th className="px-4 py-3">Δ Settimanale</th>
                <th className="px-4 py-3">Media Calorie</th>
                <th className="px-4 py-3">Media Passi</th>
                <th className="px-4 py-3">Sonno Medio</th>
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
                  <td className="px-4 py-3 font-bold text-slate-900 font-mono-tabular">
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
                  <td className="px-4 py-3 text-blue-900 font-mono-tabular font-semibold">
                    {w.avgSleepHours || 8.0} h
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
