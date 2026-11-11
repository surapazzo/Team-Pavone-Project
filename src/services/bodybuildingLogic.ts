/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyLog, TrainingExperienceLevel, NutritionPhaseType } from '../types';

export interface WeeklyAggregatedMetrics {
  isoWeek: string;
  startDate: string;
  endDate: string;
  logCount: number;
  avgWeightKg: number;
  avgCaloriesKcal: number;
  avgSteps: number;
  totalWorkouts: number;
  avgSleepHours: number;
  deltaWeightKg?: number;
  deltaWeightPct?: number;
  benchmarkStatus?: 'OPTIMAL' | 'BELOW_TARGET' | 'EXCESSIVE';
  benchmarkFeedback?: string;
}

/**
 * Gets the ISO 8601 week string for a given date (e.g., '2026-W10')
 */
export function getIsoWeekString(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Aggregates daily logs into ISO weeks and computes physiological indicators
 */
export function aggregateLogsByIsoWeek(
  logs: DailyLog[],
  nutritionPhase: NutritionPhaseType = 'DEFICIT',
  experienceLevel: TrainingExperienceLevel = 'TWO_TO_FOUR_YEARS'
): WeeklyAggregatedMetrics[] {
  const groups: Record<string, DailyLog[]> = {};

  logs.forEach((log) => {
    const isoWeek = getIsoWeekString(log.log_date);
    if (!groups[isoWeek]) {
      groups[isoWeek] = [];
    }
    groups[isoWeek].push(log);
  });

  const sortedWeeks = Object.keys(groups).sort();
  const result: WeeklyAggregatedMetrics[] = [];

  sortedWeeks.forEach((isoWeek, idx) => {
    const weekLogs = groups[isoWeek].sort((a, b) => a.log_date.localeCompare(b.log_date));
    const validWeights = weekLogs.filter((l) => l.weight_kg > 0).map((l) => l.weight_kg);
    const validCalories = weekLogs.filter((l) => l.calories_kcal > 0).map((l) => l.calories_kcal);
    const validSteps = weekLogs.filter((l) => l.steps > 0).map((l) => l.steps);
    const validSleep = weekLogs.filter((l) => l.sleep_hours > 0).map((l) => l.sleep_hours);

    const avgWeight = validWeights.length > 0 
      ? Number((validWeights.reduce((a, b) => a + b, 0) / validWeights.length).toFixed(2))
      : 0;
    const avgCalories = validCalories.length > 0
      ? Math.round(validCalories.reduce((a, b) => a + b, 0) / validCalories.length)
      : 0;
    const avgSteps = validSteps.length > 0
      ? Math.round(validSteps.reduce((a, b) => a + b, 0) / validSteps.length)
      : 0;
    const avgSleep = validSleep.length > 0
      ? Number((validSleep.reduce((a, b) => a + b, 0) / validSleep.length).toFixed(1))
      : 0;
    const totalWorkouts = weekLogs.filter((l) => l.workout_completed).length;

    let deltaWeightKg: number | undefined;
    let deltaWeightPct: number | undefined;
    let benchmarkStatus: 'OPTIMAL' | 'BELOW_TARGET' | 'EXCESSIVE' | undefined;
    let benchmarkFeedback: string | undefined;

    if (idx > 0 && result[idx - 1].avgWeightKg > 0 && avgWeight > 0) {
      const prevWeight = result[idx - 1].avgWeightKg;
      deltaWeightKg = Number((avgWeight - prevWeight).toFixed(2));
      deltaWeightPct = Number((((avgWeight - prevWeight) / prevWeight) * 100).toFixed(2));

      // Physiological check based on Francesco Pavone rules
      if (nutritionPhase === 'DEFICIT') {
        const weeklyLossRate = -deltaWeightPct; // positive if losing weight
        if (weeklyLossRate >= 0.5 && weeklyLossRate <= 1.5) {
          benchmarkStatus = 'OPTIMAL';
          benchmarkFeedback = `Perdita ottimale (-${weeklyLossRate.toFixed(2)}%/settimana). Massima preservazione massa magra.`;
        } else if (weeklyLossRate < 0.5) {
          benchmarkStatus = 'BELOW_TARGET';
          benchmarkFeedback = `Perdita inferiore al range (-${weeklyLossRate.toFixed(2)}%/settimana vs 0.5%-1.5% target). Valutare taglio calorico o incremento passi/cardio.`;
        } else {
          benchmarkStatus = 'EXCESSIVE';
          benchmarkFeedback = `Perdita eccessiva (-${weeklyLossRate.toFixed(2)}%/settimana > 1.5%). Rischio catabolismo muscolare e calo performance.`;
        }
      } else if (nutritionPhase === 'SURPLUS') {
        // Ideal monthly gain converted to weekly approx
        const weeklyGainRate = deltaWeightPct;
        let idealMonthlyMin = 0.5;
        let idealMonthlyMax = 1.0;
        if (experienceLevel === 'UNDER_2_YEARS') {
          idealMonthlyMin = 1.0;
          idealMonthlyMax = 1.5;
        } else if (experienceLevel === 'OVER_4_YEARS') {
          idealMonthlyMin = 0.4;
          idealMonthlyMax = 0.8;
        }
        const idealWeeklyMin = idealMonthlyMin / 4.3;
        const idealWeeklyMax = idealMonthlyMax / 4.3;

        if (weeklyGainRate >= idealWeeklyMin && weeklyGainRate <= idealWeeklyMax) {
          benchmarkStatus = 'OPTIMAL';
          benchmarkFeedback = `Aumento massa pulito (+${weeklyGainRate.toFixed(2)}%/settimana). In linea con anzianità di allenamento.`;
        } else if (weeklyGainRate < idealWeeklyMin) {
          benchmarkStatus = 'BELOW_TARGET';
          benchmarkFeedback = `Surplus conservativo (+${weeklyGainRate.toFixed(2)}%/settimana). Margine per aumentare carboidrati nei giorni ON.`;
        } else {
          benchmarkStatus = 'EXCESSIVE';
          benchmarkFeedback = `Aumento troppo rapido (+${weeklyGainRate.toFixed(2)}%/settimana). Rischio accumulo adiposo non funzionale.`;
        }
      }
    }

    result.push({
      isoWeek,
      startDate: weekLogs[0].log_date,
      endDate: weekLogs[weekLogs.length - 1].log_date,
      logCount: weekLogs.length,
      avgWeightKg: avgWeight,
      avgCaloriesKcal: avgCalories,
      avgSteps: avgSteps,
      totalWorkouts,
      avgSleepHours: avgSleep,
      deltaWeightKg,
      deltaWeightPct,
      benchmarkStatus,
      benchmarkFeedback,
    });
  });

  return result;
}

/**
 * Calculates 7-day moving averages up to the latest log
 */
export function calculate7DayMovingAverages(logs: DailyLog[]) {
  if (!logs || logs.length === 0) {
    return { avgWeight: 0, avgCalories: 0, avgSteps: 0, totalWorkouts: 0, daysCount: 0 };
  }

  const sorted = [...logs].sort((a, b) => b.log_date.localeCompare(a.log_date));
  const last7 = sorted.slice(0, 7);

  const weights = last7.filter((l) => l.weight_kg > 0).map((l) => l.weight_kg);
  const calories = last7.filter((l) => l.calories_kcal > 0).map((l) => l.calories_kcal);
  const steps = last7.filter((l) => l.steps > 0).map((l) => l.steps);
  const sleep = last7.filter((l) => l.sleep_hours > 0).map((l) => l.sleep_hours);
  const workouts = last7.filter((l) => l.workout_completed).length;

  return {
    avgWeight: weights.length > 0 ? Number((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(2)) : 0,
    avgCalories: calories.length > 0 ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length) : 0,
    avgSteps: steps.length > 0 ? Math.round(steps.reduce((a, b) => a + b, 0) / steps.length) : 0,
    avgSleep: sleep.length > 0 ? Number((sleep.reduce((a, b) => a + b, 0) / sleep.length).toFixed(1)) : 8.0,
    totalWorkouts: workouts,
    daysCount: last7.length,
  };
}
