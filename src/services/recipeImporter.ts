/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import {
  HandPortionEquivalents,
  RecipeItem,
  RecipeMealType,
  RecipeTag,
} from '../types';

export type RecipeDraftInput = Omit<RecipeItem, 'id' | 'updated_at'>;

export interface RecipeImportResult {
  recipes: RecipeDraftInput[];
  errors: string[];
  detectedFormat: 'JSON' | 'EXCEL' | 'CSV';
}

export function computeHandPortionsFromMacros(
  proteinG: number,
  carbsG: number,
  fatsG: number,
  fistsVeggies = 1
): HandPortionEquivalents {
  return {
    palms_protein: Number((Math.max(0, proteinG) / 30).toFixed(1)),
    cupped_hands_carbs: Number((Math.max(0, carbsG) / 28).toFixed(1)),
    thumbs_fats: Number((Math.max(0, fatsG) / 11).toFixed(1)),
    fists_veggies: Math.max(0, fistsVeggies),
  };
}

function normalizeMealType(raw: unknown): RecipeMealType {
  const s = String(raw || '').trim().toUpperCase();
  if (s === 'BREAKFAST' || s.includes('COLAZ')) return 'BREAKFAST';
  if (s === 'LUNCH' || s.includes('PRANZ')) return 'LUNCH';
  if (s === 'DINNER' || s.includes('CEN')) return 'DINNER';
  if (s === 'SNACK' || s.includes('SPUNT') || s.includes('MEREND')) return 'SNACK';
  return 'LUNCH';
}

function normalizeTags(raw: unknown): RecipeTag[] {
  const tokens: string[] = Array.isArray(raw)
    ? raw.map((x) => String(x))
    : String(raw || '')
        .split(/[,;|]+/)
        .map((x) => x.trim())
        .filter(Boolean);

  const valid = new Set<RecipeTag>();
  tokens.forEach((tok) => {
    const u = tok.toUpperCase().replace(/[\s-]+/g, '_');
    if (u === 'NO_COOK' || u.includes('FRIGO') || u.includes('NOCOOK')) valid.add('NO_COOK');
    else if (u === 'HEALTHY_SNACKS' || u.includes('SNACK')) valid.add('HEALTHY_SNACKS');
    else if (u === 'HIGH_PROTEIN' || u.includes('PROTEIN') || u.includes('PROTEIC')) valid.add('HIGH_PROTEIN');
    else if (u === 'MEDITERRANEAN' || u.includes('MEDITERRAN')) valid.add('MEDITERRANEAN');
    else if (u === 'VEGAN') valid.add('VEGAN');
    else if (u === 'VEGETARIAN' || u.includes('VEGETAR')) valid.add('VEGETARIAN');
  });

  if (valid.size === 0) {
    valid.add('HIGH_PROTEIN');
  }
  return Array.from(valid);
}

function normalizeIngredients(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean);
  }
  const str = String(raw || '').trim();
  if (!str) return [];
  return str
    .split(/[\n;|]+/)
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

function parseNumber(raw: unknown, fallback = 0): number {
  if (typeof raw === 'number' && !isNaN(raw)) return Math.round(raw);
  const cleaned = String(raw || '').replace(',', '.').replace(/[^\d.]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? fallback : Math.round(n);
}

function mapRawRowToRecipe(row: Record<string, unknown>, rowIndex: number): { recipe?: RecipeDraftInput; error?: string } {
  // Normalize keys to lowercase without spaces/underscores for flexible Italian/English matching
  const normalized: Record<string, unknown> = {};
  Object.entries(row).forEach(([k, v]) => {
    normalized[k.toLowerCase().trim()] = v;
  });

  const pick = (candidates: string[]): unknown => {
    for (const c of candidates) {
      if (normalized[c] !== undefined && normalized[c] !== '') return normalized[c];
    }
    for (const [k, v] of Object.entries(normalized)) {
      if (candidates.some((c) => k.includes(c)) && v !== undefined && v !== '') return v;
    }
    return undefined;
  };

  const titleIt = String(pick(['title_it', 'titolo_it', 'titolo', 'title', 'nome', 'ricetta', 'name']) || '').trim();
  if (!titleIt) {
    return { error: `Riga ${rowIndex}: titolo ricetta mancante, riga ignorata.` };
  }
  const titleEn = String(pick(['title_en', 'titolo_en']) || titleIt).trim();

  const mealType = normalizeMealType(pick(['meal_type', 'pasto', 'categoria', 'category', 'tipo_pasto']));
  const tags = normalizeTags(pick(['tags', 'tag', 'etichette', 'filtri']));
  const prepMinutes = parseNumber(pick(['prep_minutes', 'tempo', 'minuti', 'prep_time', 'prep_min']), 10);

  const proteinG = parseNumber(pick(['protein_g', 'proteine_g', 'proteine', 'protein', 'pro']), 25);
  const carbsG = parseNumber(pick(['carbs_g', 'carboidrati_g', 'carboidrati', 'carbs', 'cho']), 35);
  const fatsG = parseNumber(pick(['fats_g', 'fat_g', 'grassi_g', 'grassi', 'fats', 'fat']), 10);
  const rawKcal = parseNumber(pick(['kcal', 'calories', 'calorie', 'calories_kcal']), 0);
  const kcal = rawKcal > 0 ? rawKcal : Math.round(proteinG * 4 + carbsG * 4 + fatsG * 9);

  const ingredientsIt = normalizeIngredients(pick(['ingredients_it', 'ingredienti_it', 'ingredienti', 'ingredients']));
  const ingredientsEn = normalizeIngredients(pick(['ingredients_en'])) || [];

  const stepsIt = String(
    pick(['steps_it', 'preparazione', 'procedimento', 'steps', 'instructions', 'istruzioni']) ||
      'Unire gli ingredienti e servire secondo le porzioni indicate.'
  ).trim();
  const stepsEn = String(pick(['steps_en']) || stepsIt).trim();

  const storageIt = String(
    pick(['storage_tip_it', 'conservazione', 'meal_prep', 'storage_tip', 'storage']) ||
      'Conservabile in frigorifero in contenitore ermetico per 2-3 giorni.'
  ).trim();
  const storageEn = String(pick(['storage_tip_en']) || storageIt).trim();

  const imageUrlRaw = String(pick(['image_url', 'immagine', 'foto', 'image']) || '').trim();
  const fists = parseNumber(pick(['fists_veggies', 'pugni_verdure', 'verdure']), 1);

  return {
    recipe: {
      title_it: titleIt,
      title_en: titleEn,
      meal_type: mealType,
      tags,
      prep_minutes: Math.max(1, prepMinutes),
      kcal,
      protein_g: proteinG,
      carbs_g: carbsG,
      fats_g: fatsG,
      hand_portions: computeHandPortionsFromMacros(proteinG, carbsG, fatsG, fists),
      ingredients_it: ingredientsIt.length > 0 ? ingredientsIt : ['Ingredienti personalizzati da scheda'],
      ingredients_en: ingredientsEn.length > 0 ? ingredientsEn : (ingredientsIt.length > 0 ? ingredientsIt : ['Custom ingredients']),
      steps_it: stepsIt,
      steps_en: stepsEn,
      storage_tip_it: storageIt,
      storage_tip_en: storageEn,
      image_url: imageUrlRaw && /^https?:\/\//i.test(imageUrlRaw) ? imageUrlRaw : undefined,
    },
  };
}

export function parseRecipeText(rawText: string): RecipeImportResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { recipes: [], errors: ['Inserisci un file o incolla il testo CSV / JSON delle ricette.'], detectedFormat: 'CSV' };
  }

  // Try JSON first
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const list: Record<string, unknown>[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.recipes)
        ? parsed.recipes
        : [parsed];
      const recipes: RecipeDraftInput[] = [];
      const errors: string[] = [];
      list.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          const res = mapRawRowToRecipe(item, idx + 1);
          if (res.recipe) recipes.push(res.recipe);
          if (res.error) errors.push(res.error);
        }
      });
      return { recipes, errors, detectedFormat: 'JSON' };
    } catch {
      return {
        recipes: [],
        errors: ['JSON non valido. Controlla parentesi e virgolette oppure usa il formato CSV/Excel.'],
        detectedFormat: 'JSON',
      };
    }
  }

  // Parse CSV/TSV via XLSX utility for reliable quoted-field support
  try {
    const workbook = XLSX.read(trimmed, { type: 'string' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
    const recipes: RecipeDraftInput[] = [];
    const errors: string[] = [];
    rows.forEach((row, idx) => {
      const res = mapRawRowToRecipe(row, idx + 2);
      if (res.recipe) recipes.push(res.recipe);
      if (res.error) errors.push(res.error);
    });
    if (recipes.length === 0 && errors.length === 0) {
      errors.push('Nessuna riga valida trovata nel testo CSV.');
    }
    return { recipes, errors, detectedFormat: 'CSV' };
  } catch {
    return {
      recipes: [],
      errors: ['Formato testo non riconosciuto. Usa CSV con intestazioni oppure JSON.'],
      detectedFormat: 'CSV',
    };
  }
}

export async function parseRecipeFile(file: File): Promise<RecipeImportResult> {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.json')) {
    const text = await file.text();
    return parseRecipeText(text);
  }

  if (lowerName.endsWith('.csv') || lowerName.endsWith('.txt')) {
    const text = await file.text();
    return parseRecipeText(text);
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const recipes: RecipeDraftInput[] = [];
  const errors: string[] = [];
  rows.forEach((row, idx) => {
    const res = mapRawRowToRecipe(row, idx + 2);
    if (res.recipe) recipes.push(res.recipe);
    if (res.error) errors.push(res.error);
  });
  return { recipes, errors, detectedFormat: 'EXCEL' };
}

const SAMPLE_TEMPLATE_ROWS = [
  {
    titolo: 'Bowl Salmone Teriyaki & Riso Basmati',
    pasto: 'LUNCH',
    tag: 'HIGH_PROTEIN, MEDITERRANEAN',
    minuti: 15,
    kcal: 540,
    proteine_g: 36,
    carboidrati_g: 58,
    grassi_g: 16,
    pugni_verdure: 1,
    ingredienti: '150g Salmone fresco; 80g Riso Basmati; 150g Edamame e zucchine; 10ml Salsa Teriyaki light',
    preparazione: 'Cuoci il riso basmati. Scotta salmone e zucchine in padella antiaderente 6 minuti, sfuma con salsa teriyaki e componi la bowl.',
    conservazione: 'Frigo fino a 48 ore in contenitore di vetro ermetico.',
  },
  {
    titolo: 'Mousse Proteica Cacao & Lamponi (Dal Frigo)',
    pasto: 'SNACK',
    tag: 'NO_COOK, HEALTHY_SNACKS, HIGH_PROTEIN, VEGETARIAN',
    minuti: 3,
    kcal: 225,
    proteine_g: 28,
    carboidrati_g: 18,
    grassi_g: 4,
    pugni_verdure: 0,
    ingredienti: '200g Yogurt Greco 0%; 15g Proteine Whey Cacao; 60g Lamponi freschi; 5g Cacao amaro',
    preparazione: 'Mescola energicamente yogurt greco, whey e cacao fino a crema liscia. Guarnisci con lamponi freschi.',
    conservazione: 'Pronto al momento oppure fino a 24h in frigo.',
  },
];

export function downloadRecipeExcelTemplate() {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ricette Team Pavone');
  XLSX.writeFile(wb, 'Template_Ricette_TeamPavone.xlsx');
}

export function downloadRecipeCsvTemplate() {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Template_Ricette_TeamPavone.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadRecipeJsonTemplate() {
  const json = JSON.stringify(SAMPLE_TEMPLATE_ROWS, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Template_Ricette_TeamPavone.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
