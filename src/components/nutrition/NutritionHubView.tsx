/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FOOD_SPECTRUM_DATA } from '../../data/upgradeSeedData';
import {
  FoodMacroCategory,
  FoodSpectrumTier,
  RecipeItem,
  RecipeMealType,
  RecipeTag,
} from '../../types';
import {
  Hand,
  Download,
  Clock,
  Search,
  CheckCircle2,
  ChefHat,
  Sliders,
  Plus,
  Upload,
  Edit3,
  Trash2,
  X,
  ImagePlus,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { stripExifFromImage } from '../../services/securityAndGdpr';
import {
  computeHandPortionsFromMacros,
  downloadRecipeCsvTemplate,
  downloadRecipeExcelTemplate,
  downloadRecipeJsonTemplate,
  parseRecipeFile,
  parseRecipeText,
  RecipeDraftInput,
} from '../../services/recipeImporter';

const RECIPE_TAG_OPTIONS: Array<{ id: RecipeTag; label: string }> = [
  { id: 'NO_COOK', label: 'Dal Frigo / No-Cook' },
  { id: 'HEALTHY_SNACKS', label: 'Healthy Snacks' },
  { id: 'HIGH_PROTEIN', label: 'High-Protein' },
  { id: 'MEDITERRANEAN', label: 'Mediterranea' },
  { id: 'VEGAN', label: 'Vegana' },
  { id: 'VEGETARIAN', label: 'Vegetariana' },
];

const MEAL_TYPE_LABELS: Record<RecipeMealType, string> = {
  BREAKFAST: 'Colazione',
  LUNCH: 'Pranzo',
  DINNER: 'Cena',
  SNACK: 'Spuntino',
};

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
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    bulkImportRecipes,
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

  // Dynamic Recipes filter & feedback state
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeMealFilter, setRecipeMealFilter] = useState<RecipeMealType | 'ALL'>('ALL');
  const [recipeTagFilter, setRecipeTagFilter] = useState<RecipeTag | 'ALL'>('ALL');
  const [recipeScopeFilter, setRecipeScopeFilter] = useState<'ALL' | 'OFFICIAL' | 'MINE'>('ALL');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [recipeFeedbackMsg, setRecipeFeedbackMsg] = useState<string | null>(null);

  // Recipe Builder Modal State (Write / Edit)
  const [isRecipeEditorOpen, setIsRecipeEditorOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [formTitleIt, setFormTitleIt] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formMealType, setFormMealType] = useState<RecipeMealType>('LUNCH');
  const [formTags, setFormTags] = useState<RecipeTag[]>(['HIGH_PROTEIN']);
  const [formPrepMin, setFormPrepMin] = useState(10);
  const [formProteinG, setFormProteinG] = useState(35);
  const [formCarbsG, setFormCarbsG] = useState(50);
  const [formFatsG, setFormFatsG] = useState(12);
  const [formAutoKcal, setFormAutoKcal] = useState(true);
  const [formKcal, setFormKcal] = useState(448);
  const [formVeggieFists, setFormVeggieFists] = useState(1);
  const [formIngredients, setFormIngredients] = useState<string[]>(['']);
  const [formStepsIt, setFormStepsIt] = useState('');
  const [formStorageIt, setFormStorageIt] = useState('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  // Bulk Upload / Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkRawText, setBulkRawText] = useState('');
  const [bulkPreviewRecipes, setBulkPreviewRecipes] = useState<RecipeDraftInput[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkFileName, setBulkFileName] = useState<string>('');

  const recipeCountsByMeal = useMemo(() => {
    return {
      BREAKFAST: recipes.filter((r) => r.meal_type === 'BREAKFAST').length,
      LUNCH: recipes.filter((r) => r.meal_type === 'LUNCH').length,
      DINNER: recipes.filter((r) => r.meal_type === 'DINNER').length,
      SNACK: recipes.filter((r) => r.meal_type === 'SNACK').length,
      OFFICIAL: recipes.filter((r) => r.is_official !== false).length,
      MINE: recipes.filter((r) => r.author_id === currentUser.id).length,
    };
  }, [recipes, currentUser.id]);

  const filteredRecipes = useMemo(() => {
    const q = recipeSearch.toLowerCase().trim();
    return recipes.filter((r) => {
      if (recipeScopeFilter === 'OFFICIAL' && r.is_official === false) return false;
      if (recipeScopeFilter === 'MINE' && r.author_id !== currentUser.id) return false;
      if (recipeMealFilter !== 'ALL' && r.meal_type !== recipeMealFilter) return false;
      if (recipeTagFilter !== 'ALL' && !r.tags.includes(recipeTagFilter)) return false;
      if (q) {
        const title = (locale === 'en' ? r.title_en : r.title_it).toLowerCase();
        const ing = (locale === 'en' ? r.ingredients_en : r.ingredients_it).join(' ').toLowerCase();
        const author = (r.author_name || '').toLowerCase();
        if (!title.includes(q) && !ing.includes(q) && !author.includes(q)) return false;
      }
      return true;
    });
  }, [recipes, recipeScopeFilter, recipeSearch, recipeMealFilter, recipeTagFilter, locale, currentUser.id]);

  const showToast = (msg: string) => {
    setRecipeFeedbackMsg(msg);
    setTimeout(() => setRecipeFeedbackMsg(null), 4500);
  };

  const liveFormHandPortions = useMemo(
    () => computeHandPortionsFromMacros(formProteinG, formCarbsG, formFatsG, formVeggieFists),
    [formProteinG, formCarbsG, formFatsG, formVeggieFists]
  );

  const computedFormKcal = useMemo(
    () => Math.round(formProteinG * 4 + formCarbsG * 4 + formFatsG * 9),
    [formProteinG, formCarbsG, formFatsG]
  );

  const handleOpenCreateRecipe = () => {
    setEditingRecipeId(null);
    setFormTitleIt('');
    setFormTitleEn('');
    setFormMealType('LUNCH');
    setFormTags(['HIGH_PROTEIN']);
    setFormPrepMin(10);
    setFormProteinG(35);
    setFormCarbsG(50);
    setFormFatsG(12);
    setFormAutoKcal(true);
    setFormKcal(448);
    setFormVeggieFists(1);
    setFormIngredients(['150g Petto di pollo o tacchino', '80g Riso Basmati', '150g Verdure di stagione']);
    setFormStepsIt('');
    setFormStorageIt('Conservabile in frigorifero in contenitore ermetico per 2-3 giorni.');
    setFormImageUrl('');
    setIsRecipeEditorOpen(true);
  };

  const handleOpenEditRecipe = (rec: RecipeItem) => {
    setEditingRecipeId(rec.id);
    setFormTitleIt(rec.title_it);
    setFormTitleEn(rec.title_en);
    setFormMealType(rec.meal_type);
    setFormTags(rec.tags.length > 0 ? rec.tags : ['HIGH_PROTEIN']);
    setFormPrepMin(rec.prep_minutes);
    setFormProteinG(rec.protein_g);
    setFormCarbsG(rec.carbs_g);
    setFormFatsG(rec.fats_g);
    setFormAutoKcal(false);
    setFormKcal(rec.kcal);
    setFormVeggieFists(rec.hand_portions.fists_veggies);
    setFormIngredients(rec.ingredients_it.length > 0 ? rec.ingredients_it : ['']);
    setFormStepsIt(rec.steps_it);
    setFormStorageIt(rec.storage_tip_it);
    setFormImageUrl(rec.image_url || '');
    setIsRecipeEditorOpen(true);
  };

  const handleToggleFormTag = (tag: RecipeTag) => {
    setFormTags((prev) =>
      prev.includes(tag)
        ? prev.length > 1
          ? prev.filter((tItem) => tItem !== tag)
          : prev
        : [...prev, tag]
    );
  };

  const handleRecipePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    try {
      const { cleanDataUrl } = await stripExifFromImage(file);
      setFormImageUrl(cleanDataUrl);
    } catch {
      showToast('Impossibile leggere immagine selezionata.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleSaveRecipeForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleIt.trim()) return;

    const cleanedIngredients = formIngredients.map((i) => i.trim()).filter(Boolean);
    const resolvedKcal = formAutoKcal ? computedFormKcal : formKcal;

    const payload: Omit<RecipeItem, 'id' | 'updated_at'> = {
      title_it: formTitleIt.trim(),
      title_en: (formTitleEn || formTitleIt).trim(),
      meal_type: formMealType,
      tags: formTags,
      prep_minutes: Math.max(1, formPrepMin),
      kcal: Math.max(1, resolvedKcal),
      protein_g: Math.max(0, formProteinG),
      carbs_g: Math.max(0, formCarbsG),
      fats_g: Math.max(0, formFatsG),
      hand_portions: liveFormHandPortions,
      ingredients_it: cleanedIngredients.length > 0 ? cleanedIngredients : ['Ingredienti personalizzati'],
      ingredients_en: cleanedIngredients.length > 0 ? cleanedIngredients : ['Custom ingredients'],
      steps_it: formStepsIt.trim() || 'Prepara e assembla gli ingredienti secondo i macro indicati.',
      steps_en: formStepsIt.trim() || 'Prepare and assemble ingredients according to target macros.',
      storage_tip_it: formStorageIt.trim() || 'Conservare in frigorifero fino a 48h.',
      storage_tip_en: formStorageIt.trim() || 'Store refrigerated up to 48h.',
      image_url: formImageUrl.trim() || undefined,
    };

    if (editingRecipeId) {
      updateRecipe(editingRecipeId, payload);
      showToast(`Ricetta "${payload.title_it}" aggiornata nel ricettario.`);
    } else {
      const created = addRecipe(payload);
      setExpandedRecipeId(created.id);
      showToast(
        isCoach
          ? `Ricetta ufficiale "${payload.title_it}" pubblicata per tutto il Team Pavone!`
          : `La tua ricetta "${payload.title_it}" è stata salvata!`
      );
    }
    setIsRecipeEditorOpen(false);
  };

  const handleDeleteRecipeItem = (rec: RecipeItem) => {
    deleteRecipe(rec.id);
    if (expandedRecipeId === rec.id) setExpandedRecipeId(null);
    showToast(`Ricetta "${rec.title_it}" rimossa dal ricettario.`);
  };

  const handleOpenBulkModal = () => {
    setBulkRawText('');
    setBulkPreviewRecipes([]);
    setBulkErrors([]);
    setBulkFileName('');
    setIsBulkModalOpen(true);
  };

  const handleBulkFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFileName(file.name);
    const result = await parseRecipeFile(file);
    setBulkPreviewRecipes(result.recipes);
    setBulkErrors(result.errors);
  };

  const handleParseBulkText = () => {
    const result = parseRecipeText(bulkRawText);
    setBulkFileName(`Testo incollato (${result.detectedFormat})`);
    setBulkPreviewRecipes(result.recipes);
    setBulkErrors(result.errors);
  };

  const handleConfirmBulkImport = () => {
    if (bulkPreviewRecipes.length === 0) return;
    const { addedCount, updatedCount } = bulkImportRecipes(bulkPreviewRecipes);
    setIsBulkModalOpen(false);
    showToast(
      `Importazione in blocco completata: ${addedCount} ricette aggiunte, ${updatedCount} aggiornate!`
    );
  };

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
            Conversione automatica Grammi ↔ Porzioni a Mano, Spettro Alimentare, Scala Fame/Sazietà e {recipes.length} Ricette dinamiche.
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
          Ricettario & Builder ({recipes.length})
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

      {/* TAB 3: DYNAMIC RECIPE BUILDER, BULK IMPORT & MEAL PREP HUB */}
      {activeSubTab === 'RECIPES' && (
        <div className="space-y-5">
          {/* Action Toolbar: Write Recipe + Bulk Import (Coach & Athletes) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-900">
                {isCoach
                  ? 'Console Ricettario Coach & Aggiornamento Catalogo'
                  : 'Ricettario Dinamico Team Pavone & Le Tue Ricette'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isCoach
                  ? 'Scrivi nuove ricette ufficiali o carica in blocco un file Excel, CSV o JSON per aggiornare il catalogo atleti.'
                  : 'Esplora le ricette di Coach Francesco oppure scrivi e carica le tue ricette personali con macro e porzioni a mano automatiche.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenCreateRecipe}
                className="min-h-[44px] px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                style={{ backgroundColor: theme.accent_primary }}
              >
                <Plus className="w-4 h-4" />
                {isCoach ? 'Scrivi Ricetta Ufficiale' : 'Scrivi Nuova Ricetta'}
              </button>

              <button
                type="button"
                onClick={handleOpenBulkModal}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-purple-300" />
                {isCoach ? 'Carica / Aggiungi in Blocco' : 'Carica da File (CSV / JSON)'}
              </button>
            </div>
          </div>

          {recipeFeedbackMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{recipeFeedbackMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setRecipeFeedbackMsg(null)}
                className="p-1 text-emerald-700 hover:text-emerald-950 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  placeholder="Cerca ricetta, ingrediente o autore..."
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <select
                value={recipeMealFilter}
                onChange={(e) => setRecipeMealFilter(e.target.value as RecipeMealType | 'ALL')}
                className="min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="ALL">Tutti i Pasti ({recipes.length})</option>
                <option value="BREAKFAST">Colazioni ({recipeCountsByMeal.BREAKFAST})</option>
                <option value="LUNCH">Pranzi ({recipeCountsByMeal.LUNCH})</option>
                <option value="DINNER">Cene ({recipeCountsByMeal.DINNER})</option>
                <option value="SNACK">Spuntini ({recipeCountsByMeal.SNACK})</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRecipeScopeFilter('ALL')}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    recipeScopeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tutte ({recipes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipeScopeFilter('OFFICIAL')}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    recipeScopeFilter === 'OFFICIAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Catalogo Coach ({recipeCountsByMeal.OFFICIAL})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipeScopeFilter('MINE')}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    recipeScopeFilter === 'MINE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Le Mie ({recipeCountsByMeal.MINE})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(
                [
                  { id: 'ALL', label: 'Tutti i Tag' },
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
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
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

          {filteredRecipes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <ChefHat className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                Nessuna ricetta trovata con questi filtri.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateRecipe}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crea la Prima Ricetta
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRecipes.map((rec) => {
                const title = locale === 'en' ? rec.title_en : rec.title_it;
                const ingredients = locale === 'en' ? rec.ingredients_en : rec.ingredients_it;
                const steps = locale === 'en' ? rec.steps_en : rec.steps_it;
                const storage = locale === 'en' ? rec.storage_tip_en : rec.storage_tip_it;
                const isOpen = expandedRecipeId === rec.id;
                const canManage = isCoach || rec.author_id === currentUser.id;

                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    {rec.image_url && (
                      <div className="h-40 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={rec.image_url}
                          alt={title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        {/* Unboxed Metadata Line (Zero-Pill Rule) */}
                        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500">
                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                            <span className="font-bold text-purple-700">
                              {MEAL_TYPE_LABELS[rec.meal_type]}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">
                              {rec.is_official === false
                                ? `Di ${rec.author_name || 'Atleta'}`
                                : 'Catalogo Team Pavone'}
                            </span>
                          </div>
                          <span className="font-mono-tabular flex items-center gap-1 shrink-0">
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

                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setExpandedRecipeId(isOpen ? null : rec.id)}
                          className="w-full min-h-[44px] py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                        >
                          {isOpen ? 'Nascondi Dettagli' : 'Vedi Ingredienti & Meal Prep'}
                        </button>

                        {canManage && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditRecipe(rec)}
                              className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Modifica
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRecipeItem(rec)}
                              className="min-h-[40px] min-w-[44px] px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                              aria-label={`Elimina ${title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: WRITE / EDIT RECIPE BUILDER */}
      {isRecipeEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  {isCoach ? 'Catalogo Ufficiale Team Pavone' : 'Le Tue Ricette Personali'}
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingRecipeId ? 'Modifica Ricetta' : 'Scrivi Nuova Ricetta'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRecipeEditorOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipeForm} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Titolo Ricetta *</label>
                  <input
                    type="text"
                    required
                    value={formTitleIt}
                    onChange={(e) => setFormTitleIt(e.target.value)}
                    placeholder="es. Bowl Pollo, Riso Venere & Avocado"
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Titolo EN (opzionale)</label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="es. Chicken & Black Rice Bowl"
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pasto</label>
                  <select
                    value={formMealType}
                    onChange={(e) => setFormMealType(e.target.value as RecipeMealType)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="BREAKFAST">Colazione</option>
                    <option value="LUNCH">Pranzo</option>
                    <option value="DINNER">Cena</option>
                    <option value="SNACK">Spuntino</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempo Prep (min)</label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={formPrepMin}
                    onChange={(e) => setFormPrepMin(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono-tabular font-bold text-slate-900"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">Pugni Verdure</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={formVeggieFists}
                    onChange={(e) => setFormVeggieFists(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono-tabular font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Tags Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Categorie & Filtri</label>
                <div className="flex flex-wrap gap-1.5">
                  {RECIPE_TAG_OPTIONS.map((tagOpt) => {
                    const active = formTags.includes(tagOpt.id);
                    return (
                      <button
                        key={tagOpt.id}
                        type="button"
                        onClick={() => handleToggleFormTag(tagOpt.id)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
                          active
                            ? 'bg-purple-700 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tagOpt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Macros + Auto Hand Portions Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-slate-900">Valori Nutrizionali & Porzioni a Mano</span>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formAutoKcal}
                      onChange={(e) => setFormAutoKcal(e.target.checked)}
                      className="accent-purple-700"
                    />
                    Calcola Kcal auto
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-800 mb-1">Proteine (g)</label>
                    <input
                      type="number"
                      min={0}
                      value={formProteinG}
                      onChange={(e) => setFormProteinG(Number(e.target.value))}
                      className="w-full min-h-[42px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono-tabular font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-800 mb-1">Carboidrati (g)</label>
                    <input
                      type="number"
                      min={0}
                      value={formCarbsG}
                      onChange={(e) => setFormCarbsG(Number(e.target.value))}
                      className="w-full min-h-[42px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono-tabular font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-800 mb-1">Grassi (g)</label>
                    <input
                      type="number"
                      min={0}
                      value={formFatsG}
                      onChange={(e) => setFormFatsG(Number(e.target.value))}
                      className="w-full min-h-[42px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono-tabular font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Calorie (kcal)</label>
                    <input
                      type="number"
                      min={1}
                      disabled={formAutoKcal}
                      value={formAutoKcal ? computedFormKcal : formKcal}
                      onChange={(e) => setFormKcal(Number(e.target.value))}
                      className="w-full min-h-[42px] px-3 py-1.5 bg-white disabled:bg-slate-100 border border-slate-300 rounded-xl font-mono-tabular font-bold"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-purple-900 font-mono-tabular">
                  Equivalenti a mano: <strong>{liveFormHandPortions.palms_protein}</strong> Palmi Pro ·{' '}
                  <strong>{liveFormHandPortions.cupped_hands_carbs}</strong> Manciate Cho ·{' '}
                  <strong>{liveFormHandPortions.thumbs_fats}</strong> Pollici Fat ·{' '}
                  <strong>{liveFormHandPortions.fists_veggies}</strong> Pugni Veg
                </div>
              </div>

              {/* Photo Upload (EXIF-stripped) */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Foto Piatto (opzionale · EXIF rimosso)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold inline-flex items-center gap-2 cursor-pointer">
                    <ImagePlus className="w-4 h-4 text-purple-700" />
                    {isProcessingPhoto ? 'Elaborazione...' : 'Carica Foto'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRecipePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {formImageUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={formImageUrl}
                        alt="Anteprima ricetta"
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="min-h-[40px] px-2.5 py-1 rounded-lg text-rose-700 hover:bg-rose-50 font-bold cursor-pointer"
                      >
                        Rimuovi Foto
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Ingredienti *</label>
                  <button
                    type="button"
                    onClick={() => setFormIngredients((prev) => [...prev, ''])}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aggiungi Ingrediente
                  </button>
                </div>
                <div className="space-y-2">
                  {formIngredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ing}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormIngredients((prev) => prev.map((item, i) => (i === idx ? val : item)));
                        }}
                        placeholder={`Ingrediente ${idx + 1} (es. 150g Petto di Pollo)`}
                        className="flex-1 min-h-[42px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                      {formIngredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormIngredients((prev) => prev.filter((_, i) => i !== idx))}
                          className="min-h-[42px] min-w-[42px] rounded-xl hover:bg-rose-50 text-rose-600 flex items-center justify-center cursor-pointer"
                          aria-label="Rimuovi ingrediente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preparazione *</label>
                <textarea
                  rows={3}
                  required
                  value={formStepsIt}
                  onChange={(e) => setFormStepsIt(e.target.value)}
                  placeholder="Descrivi passo per passo come cucinare o assemblare il piatto..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Meal-Prep & Conservazione</label>
                <input
                  type="text"
                  value={formStorageIt}
                  onChange={(e) => setFormStorageIt(e.target.value)}
                  placeholder="es. Conservabile in frigo 3 giorni in schiscetta ermetica."
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRecipeEditorOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl text-white font-extrabold cursor-pointer"
                  style={{ backgroundColor: theme.accent_primary }}
                >
                  {editingRecipeId ? 'Salva Modifiche' : 'Pubblica Ricetta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK UPLOAD / IMPORT RECIPES (EXCEL / CSV / JSON) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  {isCoach ? 'Aggiornamento Rapido Catalogo Coach' : 'Importazione Personale'}
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  Carica / Importa Ricette in Blocco
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Step 1: Download Templates */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="font-extrabold text-slate-900">
                  1. Scarica un Template pronto (facoltativo)
                </div>
                <p className="text-slate-600">
                  Compila più ricette in Excel, CSV o JSON e caricale qui per aggiungerle o aggiornarle in un clic. Le porzioni a mano vengono calcolate in automatico.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={downloadRecipeExcelTemplate}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    Template Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={downloadRecipeCsvTemplate}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-purple-700" />
                    Template CSV (.csv)
                  </button>
                  <button
                    type="button"
                    onClick={downloadRecipeJsonTemplate}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-indigo-700" />
                    Template JSON (.json)
                  </button>
                </div>
              </div>

              {/* Step 2: Upload File or Paste Text */}
              <div className="grid md:grid-cols-2 gap-4">
                <label className="p-5 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/40 hover:bg-purple-50 flex flex-col items-center justify-center text-center gap-2 cursor-pointer min-h-[160px]">
                  <Upload className="w-7 h-7 text-purple-700" />
                  <span className="font-extrabold text-slate-900">
                    Carica File .xlsx, .csv o .json
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {bulkFileName ? `Selezionato: ${bulkFileName}` : 'Tocca per scegliere un file dal dispositivo'}
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.json,.txt"
                    onChange={handleBulkFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="space-y-2 flex flex-col">
                  <label className="font-extrabold text-slate-900">
                    Oppure incolla CSV / JSON direttamente
                  </label>
                  <textarea
                    rows={5}
                    value={bulkRawText}
                    onChange={(e) => setBulkRawText(e.target.value)}
                    placeholder={'[{"titolo": "Riso & Merluzzo", "pasto": "DINNER", "proteine_g": 40, "carboidrati_g": 65, "grassi_g": 8, "ingredienti": "200g Merluzzo; 90g Riso; Zucchine"}]'}
                    className="w-full flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleParseBulkText}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer self-end"
                  >
                    Analizza Testo
                  </button>
                </div>
              </div>

              {/* Validation Errors */}
              {bulkErrors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    Avvisi di Parsing ({bulkErrors.length})
                  </div>
                  <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                    {bulkErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              {bulkPreviewRecipes.length > 0 && (
                <div className="space-y-2">
                  <div className="font-extrabold text-slate-900">
                    Anteprima Ricette Pronte all&apos;Importazione ({bulkPreviewRecipes.length})
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <th className="p-2.5 font-bold">Titolo</th>
                          <th className="p-2.5 font-bold">Pasto</th>
                          <th className="p-2.5 font-bold font-mono-tabular">Kcal</th>
                          <th className="p-2.5 font-bold font-mono-tabular">P / C / F</th>
                          <th className="p-2.5 font-bold font-mono-tabular">Ingredienti</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkPreviewRecipes.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-0">
                            <td className="p-2.5 font-bold text-slate-900">{item.title_it}</td>
                            <td className="p-2.5 text-purple-700 font-semibold">{MEAL_TYPE_LABELS[item.meal_type]}</td>
                            <td className="p-2.5 font-mono-tabular">{item.kcal}</td>
                            <td className="p-2.5 font-mono-tabular">
                              {item.protein_g} / {item.carbs_g} / {item.fats_g}g
                            </td>
                            <td className="p-2.5 font-mono-tabular">{item.ingredients_it.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={bulkPreviewRecipes.length === 0}
                onClick={handleConfirmBulkImport}
                className="min-h-[44px] px-5 py-2 rounded-xl text-white text-xs font-extrabold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.accent_primary }}
              >
                Importa {bulkPreviewRecipes.length} Ricette
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
