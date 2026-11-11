/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { DailyLog } from '../types';

export interface ExcelImportSummary {
  fileName: string;
  totalRows: number;
  importedLogs: DailyLog[];
  detectedColumns: string[];
  dateRange: { start: string; end: string };
  errors: string[];
}

/**
 * Normalizes Italian or standard date strings into YYYY-MM-DD
 */
function normalizeDate(val: unknown): string | null {
  if (!val) return null;

  // Excel serial number date
  if (typeof val === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + val * 86400000);
    return date.toISOString().split('T')[0];
  }

  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }

  const str = String(val).trim();

  // YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/]/);
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
    const parts = str.split(/[-/]/);
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }

  // Try standard parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Intelligent Excel & CSV Parser for Athlete Daily Logs
 * Automatically maps varying column naming conventions used in coaching sheets.
 */
export async function parseAthleteExcelFile(
  file: File,
  athleteId: string
): Promise<ExcelImportSummary> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  // Use the first sheet or a sheet named 'Log' / 'Dati' / 'Daily'
  const sheetNames = workbook.SheetNames;
  let targetSheetName = sheetNames[0];
  for (const name of sheetNames) {
    const lower = name.toLowerCase();
    if (lower.includes('log') || lower.includes('dati') || lower.includes('daily') || lower.includes('peso')) {
      targetSheetName = name;
      break;
    }
  }

  const worksheet = workbook.Sheets[targetSheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const errors: string[] = [];
  const detectedCols = new Set<string>();
  const importedLogs: DailyLog[] = [];

  if (rawRows.length === 0) {
    return {
      fileName: file.name,
      totalRows: 0,
      importedLogs: [],
      detectedColumns: [],
      dateRange: { start: '', end: '' },
      errors: ['Il foglio Excel selezionato è vuoto o non contiene righe leggibili.'],
    };
  }

  rawRows.forEach((row, idx) => {
    // Find column matches case-insensitively
    let dateVal: unknown = null;
    let weightVal = 0;
    let caloriesVal = 0;
    let stepsVal = 0;
    let sleepVal = 8.0;
    let workoutVal = false;
    let waistVal: number | undefined = undefined;
    let hipsVal: number | undefined = undefined;
    let notesVal = '';

    for (const [key, val] of Object.entries(row)) {
      const col = key.toLowerCase().trim();
      detectedCols.add(key);

      // Date match
      if (col.includes('data') || col.includes('date') || col.includes('giorno')) {
        dateVal = val;
      }
      // Weight match
      else if (col.includes('peso') || col.includes('weight') || col.includes('kg') || col.includes('mattina')) {
        const num = parseFloat(String(val).replace(',', '.'));
        if (!isNaN(num) && num > 30 && num < 250) {
          weightVal = Number(num.toFixed(2));
        }
      }
      // Calories match
      else if (col.includes('calori') || col.includes('kcal') || col.includes('energia')) {
        const num = parseInt(String(val), 10);
        if (!isNaN(num) && num > 500 && num < 8000) {
          caloriesVal = num;
        }
      }
      // Steps match
      else if (col.includes('passi') || col.includes('step')) {
        const num = parseInt(String(val).replace(/\./g, ''), 10);
        if (!isNaN(num) && num >= 0) {
          stepsVal = num;
        }
      }
      // Sleep match
      else if (col.includes('sonno') || col.includes('sleep') || col.includes('ore')) {
        const num = parseFloat(String(val).replace(',', '.'));
        if (!isNaN(num) && num >= 0 && num <= 24) {
          sleepVal = Number(num.toFixed(1));
        }
      }
      // Workout match
      else if (col.includes('workout') || col.includes('allenamento') || col.includes('wo') || col.includes('palestra')) {
        const str = String(val).toLowerCase().trim();
        workoutVal = str === 'si' || str === 'sì' || str === 'yes' || str === 'true' || str === '1' || str.includes('push') || str.includes('pull') || str.includes('legs') || str.includes('upper') || str.includes('lower');
      }
      // Circumferences match
      else if (col.includes('vita') || col.includes('waist') || col.includes('girovita')) {
        const num = parseFloat(String(val).replace(',', '.'));
        if (!isNaN(num) && num > 40 && num < 180) waistVal = num;
      }
      else if (col.includes('fianchi') || col.includes('hips')) {
        const num = parseFloat(String(val).replace(',', '.'));
        if (!isNaN(num) && num > 40 && num < 180) hipsVal = num;
      }
      // Notes match
      else if (col.includes('note') || col.includes('comment') || col.includes('sensaz')) {
        notesVal = String(val).trim();
      }
    }

    const normalizedDate = normalizeDate(dateVal);
    if (!normalizedDate) {
      errors.push(`Riga ${idx + 2}: impossibile decodificare la data (${dateVal}). Saltata.`);
      return;
    }

    importedLogs.push({
      id: `excel-${Date.now()}-${idx}`,
      athlete_id: athleteId,
      log_date: normalizedDate,
      weight_kg: weightVal,
      calories_kcal: caloriesVal,
      steps: stepsVal,
      sleep_hours: sleepVal,
      workout_completed: workoutVal,
      waist_circ_cm: waistVal,
      hips_circ_cm: hipsVal,
      notes: notesVal || undefined,
    });
  });

  importedLogs.sort((a, b) => a.log_date.localeCompare(b.log_date));

  return {
    fileName: file.name,
    totalRows: rawRows.length,
    importedLogs,
    detectedColumns: Array.from(detectedCols),
    dateRange: {
      start: importedLogs[0]?.log_date || '',
      end: importedLogs[importedLogs.length - 1]?.log_date || '',
    },
    errors,
  };
}

/**
 * Generates and downloads a ready-to-use Excel template with sample data
 */
export function generateAthleteExcelTemplate() {
  const sampleData = [
    {
      Data: '2026-03-01',
      'Peso (kg)': 82.5,
      'Calorie (kcal)': 2300,
      Passi: 11000,
      'Sonno (ore)': 8.0,
      'Workout (Sì/No)': 'Sì',
      'Girovita (cm)': 83.5,
      Note: 'Spinta A - Panca manubri 42kg',
    },
    {
      Data: '2026-03-02',
      'Peso (kg)': 82.3,
      'Calorie (kcal)': 2300,
      Passi: 10500,
      'Sonno (ore)': 7.5,
      'Workout (Sì/No)': 'Sì',
      'Girovita (cm)': 83.4,
      Note: 'Trazione A - Rematore ottimo',
    },
    {
      Data: '2026-03-03',
      'Peso (kg)': 82.1,
      'Calorie (kcal)': 2300,
      Passi: 12000,
      'Sonno (ore)': 8.0,
      'Workout (Sì/No)': 'No',
      'Girovita (cm)': 83.3,
      Note: 'Giorno OFF - Camminata e sauna',
    },
    {
      Data: '2026-03-04',
      'Peso (kg)': 82.0,
      'Calorie (kcal)': 2300,
      Passi: 11500,
      'Sonno (ore)': 7.5,
      'Workout (Sì/No)': 'Sì',
      'Girovita (cm)': 83.2,
      Note: 'Gambe A - Hack Squat profondo',
    },
    {
      Data: '2026-03-05',
      'Peso (kg)': 81.9,
      'Calorie (kcal)': 2300,
      Passi: 10800,
      'Sonno (ore)': 8.0,
      'Workout (Sì/No)': 'Sì',
      'Girovita (cm)': 83.0,
      Note: 'Upper B - Deltoidi e braccia',
    },
    {
      Data: '2026-03-06',
      'Peso (kg)': 81.7,
      'Calorie (kcal)': 2300,
      Passi: 10200,
      'Sonno (ore)': 8.5,
      'Workout (Sì/No)': 'No',
      'Girovita (cm)': 82.9,
      Note: 'Giorno OFF - Recupero attivo',
    },
    {
      Data: '2026-03-07',
      'Peso (kg)': 81.5,
      'Calorie (kcal)': 3100,
      Passi: 11200,
      'Sonno (ore)': 8.0,
      'Workout (Sì/No)': 'Sì',
      'Girovita (cm)': 82.8,
      Note: 'Ricarica Glucidica (450g Cho)',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Log Giornalieri');
  XLSX.writeFile(wb, 'Template_Log_Atleta_TeamPavone.xlsx');
}
