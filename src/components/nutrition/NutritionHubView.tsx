/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FOOD_SPECTRUM_DATA,
  CORE_RECIPES_DATABASE,
} from '../../data/upgradeSeedData';
import {
  FoodMacroCategory,
  FoodSpectrumTier,
  RecipeMealType,
  RecipeTag,
} from '../../types';
import {
  Utensils,
  Hand,
  Download,
  Clock,
  Search,
  CheckCircle2,
  ChefHat,
  Sliders,
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export const NutritionHubView: React.FC = () => {
  const {
    currentUser,
    selectedAthlete,
    macrocycleWeeks,
    hungerTargets,
    updateHungerTarget,
    satietyLogs,
    logPreMealHunger,
    logPostMealSatiety,
    locale,
    theme,
  } = useApp();
  const { t } = useTranslation();

  const isCoach = currentUser.role === 'COACH';
  const targetAthleteId = isCoach ? selectedAthlete.id : currentUser.id;
  const activeWeek = macrocycleWeeks.find((w) => w.athlete_id === targetAthleteId) || macrocycleWeeks[0];

  const [activeSubTab, setActiveSubTab] = useState<'PORTIONS_SPECTRUM' | 'HUNGER_SATIETY' | 'RECIPES'>('PORTIONS_SPECTRUM');

  // Hand-portion algorithmic conversion (Coach Pavone standard equivalents)
  // Protein: ~30g/palm | Fats: ~11g/thumb | Cooked carbs: ~28g/cupped hand | Veggies: fixed 6 fists/day
  const dayTypeSplit = useState<'ON' | 'OFF'>('ON');
  const [selectedDayType, setSelectedDayType] = dayTypeSplit;
  const [mealSplitLabel] = useState('3 Pasti Principali + 1 Spuntino');

  const macroTargets = useMemo(() => {
    const kcal = selectedDayType === 'ON' ? activeWeek?.target_kcal_on || 2300 : activeWeek?.target_kcal_off || 2100;
    const carbs = selectedDayType === 'ON' ? activeWeek?.target_carbs_on_g || 310 : activeWeek?.target_carbs_off_g || 220;
    const protein = activeWeek?.target_protein_g || 185;
    const fats = activeWeek?.target_fats_g || 50;

    return {
      kcal,
      carbs,
      protein,
      fats,
      palms: Number((protein / 30).toFixed(1)),
      thumbs: Number((fats / 11).toFixed(1)),
      cuppedHands: Number((carbs / 28).toFixed(1)),
      fistsVeggies: 6,
    };
  }, [activeWeek, selectedDayType]);

  // Food Spectrum filter
  const [spectrumCategory, setSpectrumCategory] = useState<FoodMacroCategory>('PROTEIN');

  // Hunger & Satiety Logger
  const [mealLabel, setMealLabel] = useState('Pranzo Principale');
  const [mealType, setMealType] = useState<'MAIN_MEAL' | 'SNACK'>('MAIN_MEAL');
  const [preHungerScore, setPreHungerScore] = useState(8);
  const [postSatietyDrafts, setPostSatietyDrafts] = useState<Record<string, number>>({});

  const athleteSatietyLogs = satietyLogs.filter((l) => l.athlete_id === targetAthleteId);
  const pendingSatietyLogs = athleteSatietyLogs.filter((l) => l.post_meal_satiety === undefined);

  // Recipes state
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeMealFilter, setRecipeMealFilter] = useState<RecipeMealType | 'ALL'>('ALL');
  const [recipeTagFilter, setRecipeTagFilter] = useState<RecipeTag | 'ALL'>('ALL');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    const q = recipeSearch.toLowerCase().trim();
    return CORE_RECIPES_DATABASE.filter((r) => {
      if (recipeMealFilter !== 'ALL' && r.meal_type !== recipeMealFilter) return false;
      if (recipeTagFilter !== 'ALL' && !r.tags.includes(recipeTagFilter)) return false;
      if (q) {
        const title = (locale === 'en' ? r.title_en : r.title_it).toLowerCase();
        const ing = (locale === 'en' ? r.ingredients_en : r.ingredients_it).join(' ').toLowerCase();
        if (!title.includes(q) && !ing.includes(q)) return false;
      }
      return true;
    });
  }, [recipeSearch, recipeMealFilter, recipeTagFilter, locale]);

  const handleDownloadShoppingList = () => {
    const greenItems = FOOD_SPECTRUM_DATA.filter((f) => f.tier === 'GREEN_EAT_MORE');
    const lines = [
      'TEAM PAVONE — LISTA DELLA SPESA SETTIMANALE',
      `Target: ${macroTargets.kcal} kcal (${macroTargets.palms} Palmi Pro | ${macroTargets.cuppedHands} Manciate Cho | ${macroTargets.thumbs} Pollici Fat)`,
      '',
      'ALIMENTI VERDI (EAT MORE):',
      ...greenItems.map((i) => `- [${i.category}] ${locale === 'en' ? i.name_en : i.name_it} (${locale === 'en' ? i.portion_hint_en : i.portion_hint_it})`),
      '',
      'EMERGENZA DAL FRIGO ALLA FORMA:',
      '- Fesa di tacchino arrosto pronta, Tonno al naturale, Yogurt Greco 0%, Cavoletti & spinaci prelavati, Riso basmati rapido.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teampavone_shopping_list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const mainTarget = hungerTargets.find((h) => h.meal_type === 'MAIN_MEAL');
  const snackTarget = hungerTargets.find((h) => h.meal_type === 'SNACK');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
            Moduli 4 & 5 · Nutrizione Visiva & Meal Prep
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t('nutrition.title')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Conversione automatica Grammi ↔ Porzioni a Mano, Spettro Alimentare, Scala Fame/Sazietà e {CORE_RECIPES_DATABASE.length} Ricette.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadShoppingList}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer self-start"
        >
          <Download className="w-4 h-4 text-purple-400" />
          Scarica Lista Spesa
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('PORTIONS_SPECTRUM')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'PORTIONS_SPECTRUM'
              ? 'bg-purple-700 text-white'
              : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          <Hand className="w-4 h-4" />
          Porzioni a Mano & Spettro Cibi
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('HUNGER_SATIETY')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'HUNGER_SATIETY'
              ? 'bg-purple-700 text-white'
              : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Fame & Sazietà ({pendingSatietyLogs.length} +60m)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('RECIPES')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'RECIPES'
              ? 'bg-purple-700 text-white'
              : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          Ricettario & Dal Frigo alla Forma ({CORE_RECIPES_DATABASE.length})
        </button>
      </div>

      {/* TAB 1: HAND PORTIONS + FOOD SPECTRUM */}
      {activeSubTab === 'PORTIONS_SPECTRUM' && (
        <div className="space-y-6">
          {/* Dual Macro + Hand Portion Display */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  Split Giornaliero: {mealSplitLabel}
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Target Settimana {activeWeek?.iso_week || '2026-W10'} ·{' '}
                  <span className="font-mono-tabular text-purple-700">{macroTargets.kcal} kcal</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDayType('ON')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    selectedDayType === 'ON'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Giorno ON (Allenamento)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayType('OFF')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    selectedDayType === 'OFF'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Giorno OFF (Riposo)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-purple-800">{t('nutrition.palms')}</span>
                <div className="text-2xl font-black font-mono-tabular text-purple-950">
                  {macroTargets.palms} Palmi
                </div>
                <div className="text-xs text-purple-800 font-mono-tabular">
                  = {macroTargets.protein}g Proteine
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-amber-800">{t('nutrition.cuppedHands')}</span>
                <div className="text-2xl font-black font-mono-tabular text-amber-950">
                  {macroTargets.cuppedHands} Manciate
                </div>
                <div className="text-xs text-amber-800 font-mono-tabular">
                  = {macroTargets.carbs}g Carboidrati
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-indigo-800">{t('nutrition.thumbs')}</span>
                <div className="text-2xl font-black font-mono-tabular text-indigo-950">
                  {macroTargets.thumbs} Pollici
                </div>
                <div className="text-xs text-indigo-800 font-mono-tabular">
                  = {macroTargets.fats}g Grassi
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-emerald-800">{t('nutrition.fists')}</span>
                <div className="text-2xl font-black font-mono-tabular text-emerald-950">
                  {macroTargets.fistsVeggies} Pugni
                </div>
                <div className="text-xs text-emerald-800">Verdure a foglia / fibre</div>
              </div>
            </div>
          </div>

          {/* Interactive Food Spectrum Matrix */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{t('nutrition.foodSpectrum')}</h2>
                <p className="text-xs text-slate-500">
                  Scegli prioritariamente dalla fascia Verde per massimizzare volume alimentare e micronutrienti.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['PROTEIN', 'CARBS', 'FATS', 'VEGGIES'] as FoodMacroCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSpectrumCategory(cat)}
                    className={`min-h-[38px] px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                      spectrumCategory === cat
                        ? 'bg-purple-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
              {(
                [
                  { tier: 'GREEN_EAT_MORE' as FoodSpectrumTier, label: t('nutrition.eatMore'), boxClass: 'bg-emerald-50/70 border-emerald-200 text-emerald-950', headClass: 'text-emerald-800' },
                  { tier: 'YELLOW_EAT_SOME' as FoodSpectrumTier, label: t('nutrition.eatSome'), boxClass: 'bg-amber-50/70 border-amber-200 text-amber-950', headClass: 'text-amber-800' },
                  { tier: 'RED_EAT_LESS' as FoodSpectrumTier, label: t('nutrition.eatLess'), boxClass: 'bg-rose-50/70 border-rose-200 text-rose-950', headClass: 'text-rose-800' },
                ]
              ).map((col) => {
                const items = FOOD_SPECTRUM_DATA.filter(
                  (f) => f.category === spectrumCategory && f.tier === col.tier
                );
                return (
                  <div key={col.tier} className={`p-4 rounded-2xl border ${col.boxClass} space-y-2.5`}>
                    <div className={`text-xs font-extrabold uppercase tracking-wider ${col.headClass}`}>
                      {col.label}
                    </div>
                    {items.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-white/90 border border-white shadow-xs">
                        <div className="font-bold text-slate-900">
                          {locale === 'en' ? item.name_en : item.name_it}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {locale === 'en' ? item.portion_hint_en : item.portion_hint_it}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HUNGER & SATIETY TARGET VS ACTUAL */}
      {activeSubTab === 'HUNGER_SATIETY' && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Coach Targets + Athlete Pre-Meal Logger */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Target Coach Fame vs Sazietà</h2>
              <p className="text-slate-500 mt-0.5">
                Pasti Principali: Pre <strong className="font-mono-tabular">{mainTarget?.target_pre_hunger}/10</strong> · Post{' '}
                <strong className="font-mono-tabular">{mainTarget?.target_post_satiety}/10</strong> | Spuntino: Pre{' '}
                <strong className="font-mono-tabular">{snackTarget?.target_pre_hunger}/10</strong> · Post{' '}
                <strong className="font-mono-tabular">{snackTarget?.target_post_satiety}/10</strong>
              </p>
              {isCoach && mainTarget && (
                <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-2">
                  <span className="font-bold text-purple-900">Modifica Target Main Meal (Pre/Post):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={mainTarget.target_pre_hunger}
                      onChange={(e) =>
                        updateHungerTarget('MAIN_MEAL', Number(e.target.value), mainTarget.target_post_satiety)
                      }
                      className="w-12 px-1.5 py-1 bg-white border border-purple-300 rounded text-center font-mono-tabular font-bold"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={mainTarget.target_post_satiety}
                      onChange={(e) =>
                        updateHungerTarget('MAIN_MEAL', mainTarget.target_pre_hunger, Number(e.target.value))
                      }
                      className="w-12 px-1.5 py-1 bg-white border border-purple-300 rounded text-center font-mono-tabular font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Registra Fame Prima del Pasto</h3>
              <input
                type="text"
                value={mealLabel}
                onChange={(e) => setMealLabel(e.target.value)}
                placeholder="Nome pasto (es. Pranzo / Merenda)"
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMealType('MAIN_MEAL')}
                  className={`min-h-[42px] rounded-xl font-bold border cursor-pointer ${
                    mealType === 'MAIN_MEAL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Pasto Principale
                </button>
                <button
                  type="button"
                  onClick={() => setMealType('SNACK')}
                  className={`min-h-[42px] rounded-xl font-bold border cursor-pointer ${
                    mealType === 'SNACK' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Spuntino
                </button>
              </div>
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>{t('nutrition.hungerPre')}</span>
                  <span className="font-mono-tabular text-purple-700">{preHungerScore}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={preHungerScore}
                  onChange={(e) => setPreHungerScore(Number(e.target.value))}
                  className="w-full h-3 accent-purple-700 cursor-pointer"
                />
              </div>
              <button
                type="button"
                onClick={() => logPreMealHunger(mealLabel, mealType, preHungerScore)}
                className="w-full min-h-[44px] py-2.5 rounded-xl text-white font-extrabold cursor-pointer"
                style={{ backgroundColor: theme.accent_primary }}
              >
                Salva Fame Pre-Pasto (Attiva Promemoria +60m)
              </button>
            </div>
          </div>

          {/* Pending +60m Prompt & History */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-700" />
              Check Sazietà Post-Pasto (+60 minuti) & Storico
            </h2>

            <div className="space-y-3">
              {athleteSatietyLogs.map((log) => {
                const draftVal = postSatietyDrafts[log.id] ?? 7;
                const isPending = log.post_meal_satiety === undefined;
                return (
                  <div
                    key={log.id}
                    className={`p-4 rounded-2xl border ${
                      isPending ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                    } space-y-2.5`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">{log.meal_label}</span>
                        <span className="text-[11px] text-slate-500 block font-mono-tabular">
                          {log.meal_type} · Fame Pre: <strong>{log.pre_meal_hunger}/10</strong>
                        </span>
                      </div>
                      {!isPending && (
                        <span className="font-mono-tabular font-black text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Sazietà Post: {log.post_meal_satiety}/10
                        </span>
                      )}
                    </div>

                    {isPending && (
                      <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between font-bold text-amber-950 mb-1">
                            <span>{t('nutrition.satietyPost')}</span>
                            <span className="font-mono-tabular">{draftVal}/10</span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={draftVal}
                            onChange={(e) =>
                              setPostSatietyDrafts((prev) => ({ ...prev, [log.id]: Number(e.target.value) }))
                            }
                            className="w-full h-3 accent-purple-700 cursor-pointer"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => logPostMealSatiety(log.id, draftVal)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer shrink-0"
                        >
                          Salva Sazietà +60m
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEARCHABLE 16-RECIPE & MEAL PREP HUB */}
      {activeSubTab === 'RECIPES' && (
        <div className="space-y-5">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  placeholder="Cerca ricetta o ingrediente (es. tacchino, budino, mandorle, merluzzo)..."
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <select
                value={recipeMealFilter}
                onChange={(e) => setRecipeMealFilter(e.target.value as RecipeMealType | 'ALL')}
                className="min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="ALL">Tutti i Pasti ({CORE_RECIPES_DATABASE.length})</option>
                <option value="BREAKFAST">Colazioni (4)</option>
                <option value="LUNCH">Pranzi (5)</option>
                <option value="DINNER">Cene (4)</option>
                <option value="SNACK">Spuntini (3)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(
                [
                  { id: 'ALL', label: 'Tutte' },
                  { id: 'NO_COOK', label: 'Dal Frigo alla Forma / No-Cook' },
                  { id: 'HEALTHY_SNACKS', label: '25 Healthy Snacks' },
                  { id: 'HIGH_PROTEIN', label: 'High-Protein' },
                  { id: 'MEDITERRANEAN', label: 'Mediterranea' },
                  { id: 'VEGAN', label: 'Vegana' },
                  { id: 'VEGETARIAN', label: 'Vegetariana' },
                ] as const
              ).map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setRecipeTagFilter(tag.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                    recipeTagFilter === tag.id
                      ? 'bg-purple-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecipes.map((rec) => {
              const title = locale === 'en' ? rec.title_en : rec.title_it;
              const ingredients = locale === 'en' ? rec.ingredients_en : rec.ingredients_it;
              const steps = locale === 'en' ? rec.steps_en : rec.steps_it;
              const storage = locale === 'en' ? rec.storage_tip_en : rec.storage_tip_it;
              const isOpen = expandedRecipeId === rec.id;

              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-purple-700 uppercase tracking-wider">{rec.meal_type}</span>
                      <span className="text-slate-500 font-mono-tabular flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {rec.prep_minutes} min
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{title}</h3>

                    <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-mono-tabular bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">Kcal</span>
                        <strong className="text-slate-900">{rec.kcal}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">Pro</span>
                        <strong className="text-purple-700">{rec.protein_g}g</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">Cho</span>
                        <strong className="text-slate-900">{rec.carbs_g}g</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">Fat</span>
                        <strong className="text-slate-900">{rec.fats_g}g</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 font-mono-tabular">
                      Mano: {rec.hand_portions.palms_protein} Palmi · {rec.hand_portions.cupped_hands_carbs} Manciate ·{' '}
                      {rec.hand_portions.thumbs_fats} Pollici · {rec.hand_portions.fists_veggies} Pugni
                    </div>
                  </div>

                  {isOpen && (
                    <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                      <div>
                        <strong className="text-slate-900 block mb-1">Ingredienti:</strong>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {ingredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="leading-relaxed">
                        <strong className="text-slate-900">Preparazione: </strong>
                        {steps}
                      </p>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                        <strong>Meal-Prep & Conservazione: </strong>
                        {storage}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedRecipeId(isOpen ? null : rec.id)}
                    className="w-full min-h-[42px] py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    {isOpen ? 'Nascondi Dettagli' : 'Vedi Ingredienti & Meal Prep'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
