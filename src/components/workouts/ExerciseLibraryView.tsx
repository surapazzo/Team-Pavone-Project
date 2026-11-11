/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ExerciseLibraryItem,
  MuscleGroup,
  EquipmentType,
  ExerciseItem,
} from '../../types';
import {
  Dumbbell,
  Play,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Layers,
  Video,
  X,
  Send,
  Sliders,
  Sparkles,
} from 'lucide-react';

const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  PETTORALI: 'Pettorali',
  DORSALI: 'Dorsali & Schiena',
  SPALLE: 'Spalle & Deltoidi',
  QUADRICIPITI: 'Quadricipiti',
  FEMORALI_GLUTEI: 'Femorali & Glutei',
  BICIPITI: 'Bicipiti',
  TRICIPITI: 'Tricipiti',
  CORE_ADDOME: 'Core & Addome',
  POLPACCI: 'Polpacci',
};

const MUSCLE_GROUP_COLORS: Record<MuscleGroup, { bg: string; text: string; border: string }> = {
  PETTORALI: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  DORSALI: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  SPALLE: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  QUADRICIPITI: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  FEMORALI_GLUTEI: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  BICIPITI: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  TRICIPITI: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  CORE_ADDOME: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  POLPACCI: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  BILANCIERE: 'Bilanciere',
  MANUBRI: 'Manubri',
  CAVI: 'Cavi & Carrucole',
  MACCHINARIO: 'Macchinario Guidato',
  CORPO_LIBERO: 'Corpo Libero',
};

interface ExerciseLibraryViewProps {
  onSelectForWorkout?: (exercise: ExerciseLibraryItem) => void;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  onSelectForWorkout,
}) => {
  const {
    exerciseLibrary,
    addExerciseToLibrary,
    updateExerciseInLibrary,
    deleteExerciseFromLibrary,
    workoutPrograms,
    addExerciseToProgram,
    selectedAthlete,
    currentUser,
    theme,
  } = useApp();

  const isCoach = currentUser.role === 'COACH';

  // Filters
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'ALL'>('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Builder Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('PETTORALI');
  const [equipment, setEquipment] = useState<EquipmentType>('MANUBRI');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>(['']);
  const [defaultSets, setDefaultSets] = useState(4);
  const [defaultReps, setDefaultReps] = useState('6-8');
  const [defaultRir, setDefaultRir] = useState(1);
  const [defaultRestSec, setDefaultRestSec] = useState(120);

  // Feedback banner
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Video Preview Modal
  const [activeVideoModal, setActiveVideoModal] = useState<{ name: string; url: string; description: string } | null>(null);

  // Quick Add To Program Modal
  const [quickAddExercise, setQuickAddExercise] = useState<ExerciseLibraryItem | null>(null);
  const [targetProgramId, setTargetProgramId] = useState<string>('');
  const [quickSets, setQuickSets] = useState(4);
  const [quickReps, setQuickReps] = useState('6-8');
  const [quickRir, setQuickRir] = useState(1);
  const [quickRest, setQuickRest] = useState(120);

  // Athlete programs for the selected athlete
  const athletePrograms = workoutPrograms.filter((p) => p.athlete_id === selectedAthlete.id);

  // Filtered exercises
  const filteredExercises = exerciseLibrary.filter((ex) => {
    if (selectedMuscle !== 'ALL' && ex.muscle_group !== selectedMuscle) return false;
    if (selectedEquipment !== 'ALL' && ex.equipment !== selectedEquipment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = ex.name.toLowerCase().includes(q);
      const inDesc = ex.description.toLowerCase().includes(q);
      const inKeys = ex.key_points.some((k) => k.toLowerCase().includes(q));
      if (!inName && !inDesc && !inKeys) return false;
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingExerciseId(null);
    setName('');
    setMuscleGroup('PETTORALI');
    setEquipment('MANUBRI');
    setDescription('');
    setVideoUrl('https://www.youtube.com/embed/8iPEnn-ltC8');
    setKeyPoints(['Scapole addotte e depresse', 'ROM completo', 'Fermo di 1s']);
    setDefaultSets(4);
    setDefaultReps('6-8');
    setDefaultRir(1);
    setDefaultRestSec(120);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (ex: ExerciseLibraryItem) => {
    setEditingExerciseId(ex.id);
    setName(ex.name);
    setMuscleGroup(ex.muscle_group);
    setEquipment(ex.equipment);
    setDescription(ex.description);
    setVideoUrl(ex.video_url);
    setKeyPoints(ex.key_points.length > 0 ? ex.key_points : ['']);
    setDefaultSets(ex.default_sets || 4);
    setDefaultReps(ex.default_reps || '6-8');
    setDefaultRir(ex.default_rir !== undefined ? ex.default_rir : 1);
    setDefaultRestSec(ex.default_rest_sec || 120);
    setIsEditorOpen(true);
  };

  const handleSaveExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanedPoints = keyPoints.map((k) => k.trim()).filter(Boolean);

    if (editingExerciseId) {
      updateExerciseInLibrary(editingExerciseId, {
        name,
        muscle_group: muscleGroup,
        equipment,
        description,
        key_points: cleanedPoints,
        video_url: videoUrl,
        default_sets: defaultSets,
        default_reps: defaultReps,
        default_rir: defaultRir,
        default_rest_sec: defaultRestSec,
      });
      setSuccessMsg(`Esercizio "${name}" aggiornato con successo nel catalogo!`);
    } else {
      addExerciseToLibrary({
        name,
        muscle_group: muscleGroup,
        equipment,
        description,
        key_points: cleanedPoints,
        video_url: videoUrl,
        default_sets: defaultSets,
        default_reps: defaultReps,
        default_rir: defaultRir,
        default_rest_sec: defaultRestSec,
        created_by: currentUser.id,
      });
      setSuccessMsg(`Nuovo esercizio "${name}" creato e disponibile per tutte le schede!`);
    }

    setIsEditorOpen(false);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDeleteExercise = (id: string, exName: string) => {
    if (confirm(`Sei sicuro di voler eliminare l'esercizio "${exName}" dal catalogo?`)) {
      deleteExerciseFromLibrary(id);
      setSuccessMsg(`Esercizio "${exName}" rimosso dal catalogo.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleOpenQuickAdd = (ex: ExerciseLibraryItem) => {
    setQuickAddExercise(ex);
    setTargetProgramId(athletePrograms[0]?.id || '');
    setQuickSets(ex.default_sets || 4);
    setQuickReps(ex.default_reps || '6-8');
    setQuickRir(ex.default_rir !== undefined ? ex.default_rir : 1);
    setQuickRest(ex.default_rest_sec || 120);
  };

  const handleConfirmQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddExercise || !targetProgramId) return;

    const newExItem: ExerciseItem = {
      id: `ex-${Date.now()}`,
      name: quickAddExercise.name,
      muscle_group: quickAddExercise.muscle_group,
      sets: quickSets,
      reps: quickReps,
      rir: quickRir,
      rest_sec: quickRest,
      notes: quickAddExercise.description,
      video_url: quickAddExercise.video_url,
      library_exercise_id: quickAddExercise.id,
    };

    addExerciseToProgram(targetProgramId, newExItem);
    const prog = athletePrograms.find((p) => p.id === targetProgramId);
    setSuccessMsg(
      `Esercizio "${quickAddExercise.name}" aggiunto alla scheda "${prog ? prog.split_day : 'Selezionata'}" di ${selectedAthlete.full_name}!`
    );
    setQuickAddExercise(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-xs font-bold text-purple-200">
              <Dumbbell className="w-3.5 h-3.5 text-purple-300" />
              Libreria Universale Esercizi · Metodologia Francesco Pavone
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Costruttore & Catalogo Esercizi
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
              Costruisci ogni esercizio con nome, descrizione biomeccanica, video dimostrativo nativo, distretto muscolare e punti chiave. Caricali con un click dentro le schede dei tuoi atleti.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Costruisci Nuovo Esercizio
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-6 pt-6 border-t border-purple-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-purple-300 block text-[11px]">Esercizi in Libreria:</span>
            <span className="font-extrabold text-white text-base mt-0.5 block">
              {exerciseLibrary.length} Esercizi Catalogati
            </span>
          </div>

          <div>
            <span className="text-purple-300 block text-[11px]">Gruppi Muscolari:</span>
            <span className="font-extrabold text-white text-base mt-0.5 block">
              9 Distretti Fisiologici
            </span>
          </div>

          <div>
            <span className="text-purple-300 block text-[11px]">Video Tutorial Nativi:</span>
            <span className="font-extrabold text-emerald-400 text-base mt-0.5 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              100% con Video Dimostrativo
            </span>
          </div>

          <div>
            <span className="text-purple-300 block text-[11px]">Atleta Target Attivo:</span>
            <span className="font-bold text-white text-base mt-0.5 block truncate">
              {selectedAthlete.full_name}
            </span>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search Input & Equipment Selector */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cerca esercizio per nome, biomeccanica o punti chiave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sm:w-64">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value as EquipmentType | 'ALL')}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="ALL">Tutte le Attrezzature</option>
              <option value="BILANCIERE">Bilanciere</option>
              <option value="MANUBRI">Manubri</option>
              <option value="CAVI">Cavi & Carrucole</option>
              <option value="MACCHINARIO">Macchinario Guidato</option>
              <option value="CORPO_LIBERO">Corpo Libero</option>
            </select>
          </div>
        </div>

        {/* Muscle Group Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Distretto:
          </span>

          <button
            onClick={() => setSelectedMuscle('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              selectedMuscle === 'ALL'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tutti ({exerciseLibrary.length})
          </button>

          {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map((mg) => {
            const count = exerciseLibrary.filter((e) => e.muscle_group === mg).length;
            const isSel = selectedMuscle === mg;
            return (
              <button
                key={mg}
                onClick={() => setSelectedMuscle(mg)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{MUSCLE_GROUP_LABELS[mg]}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSel ? 'bg-purple-900 text-purple-200' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises Catalog Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((ex) => {
          const color = MUSCLE_GROUP_COLORS[ex.muscle_group] || {
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            border: 'border-purple-200',
          };

          return (
            <div
              key={ex.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-purple-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden group"
            >
              {/* Header with Muscle & Equipment Badges */}
              <div className="p-5 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${color.bg} ${color.text} ${color.border}`}
                  >
                    {MUSCLE_GROUP_LABELS[ex.muscle_group]}
                  </span>

                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {EQUIPMENT_LABELS[ex.equipment]}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-purple-700 transition-colors">
                  {ex.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {ex.description}
                </p>
              </div>

              {/* Key Technical Points / Cues */}
              <div className="p-5 space-y-3 bg-slate-50/50 flex-1">
                {ex.key_points && ex.key_points.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Punti Tecnici di Esecuzione:
                    </span>
                    <ul className="space-y-1">
                      {ex.key_points.slice(0, 3).map((kp, idx) => (
                        <li key={idx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                          <span className="text-purple-600 font-bold shrink-0">•</span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Default Prescription Bar */}
                <div className="pt-3 border-t border-slate-200/60 grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-sans">Serie</span>
                    <strong className="text-slate-900">{ex.default_sets}</strong>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-sans">Reps</span>
                    <strong className="text-slate-900">{ex.default_reps}</strong>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-sans">RIR</span>
                    <strong className="text-purple-700">{ex.default_rir}</strong>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-sans">Rest</span>
                    <strong className="text-slate-700">{ex.default_rest_sec}s</strong>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
                <button
                  onClick={() =>
                    setActiveVideoModal({
                      name: ex.name,
                      url: ex.video_url,
                      description: ex.description,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-1.5 border border-purple-200"
                >
                  <Play className="w-3.5 h-3.5" />
                  Video Tutorial
                </button>

                <div className="flex items-center gap-1.5">
                  {isCoach && (
                    <>
                      <button
                        onClick={() => handleOpenQuickAdd(ex)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition-colors flex items-center gap-1 shadow-xs"
                        title="Carica questo esercizio dentro la scheda dell'atleta"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Carica in Scheda
                      </button>

                      <button
                        onClick={() => handleOpenEdit(ex)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Modifica esercizio"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteExercise(ex.id, ex.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Elimina esercizio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <Dumbbell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Nessun esercizio trovato per questi filtri</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Prova a modificare la ricerca o seleziona un altro distretto muscolare. Puoi anche costruire un nuovo esercizio con il pulsante in alto.
          </p>
          <button
            onClick={() => {
              setSelectedMuscle('ALL');
              setSelectedEquipment('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
          >
            Azzera Filtri
          </button>
        </div>
      )}

      {/* BUILDER / EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingExerciseId ? 'Modifica Esercizio Catalogo' : 'Costruttore Nuovo Esercizio (Coach Pavone)'}
                  </h3>
                  <p className="text-xs text-purple-200">
                    Definisci biomeccanica, distretto muscolare, video dimostrativo e punti chiave
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveExercise} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* Exercise Name */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nome Esercizio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Distensioni con Manubri su Panca Inclinata 30°"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />
              </div>

              {/* Muscle Group & Equipment */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Distretto Muscolare Primario *
                  </label>
                  <select
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map((mg) => (
                      <option key={mg} value={mg}>
                        {MUSCLE_GROUP_LABELS[mg]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Attrezzatura / Meccanica *
                  </label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {(Object.keys(EQUIPMENT_LABELS) as EquipmentType[]).map((eq) => (
                      <option key={eq} value={eq}>
                        {EQUIPMENT_LABELS[eq]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Descrizione Tecnica & Biomeccanica (Spiegazione per l'Atleta) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descrivi il setup articolare, l'inclinazione, l'attivazione muscolare e la traiettoria ideale..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 leading-relaxed"
                />
              </div>

              {/* Key Points / Coaching Cues */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-800">
                    Punti Tecnici Chiave (Coaching Cues)
                  </label>
                  <button
                    type="button"
                    onClick={() => setKeyPoints([...keyPoints, ''])}
                    className="text-purple-700 font-bold hover:text-purple-900 flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aggiungi Punto
                  </button>
                </div>

                <div className="space-y-2">
                  {keyPoints.map((kp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="es. Scapole addotte e depresse con fermo al petto di 1s"
                        value={kp}
                        onChange={(e) => {
                          const copy = [...keyPoints];
                          copy[idx] = e.target.value;
                          setKeyPoints(copy);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                      {keyPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setKeyPoints(keyPoints.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Video URL & Embed Preview */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Video Dimostrativo Ufficiale (YouTube Embed o URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/embed/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Supporta link YouTube Embed, video non in elenco, Loom o link diretti per visualizzazione istantanea.
                </span>

                {videoUrl && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                    <span className="text-[10px] text-purple-300 uppercase font-bold block mb-2">
                      Anteprima Player Video Dimostrativo:
                    </span>
                    <div className="relative pt-[40%] rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={videoUrl}
                        title="Anteprima Video Dimostrativo"
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Default Sets, Reps, RIR, Rest */}
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-2">
                <span className="font-bold text-purple-950 block text-xs">
                  Parametri Predefiniti per la Scheda:
                </span>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">Serie</label>
                    <input
                      type="number"
                      value={defaultSets}
                      onChange={(e) => setDefaultSets(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">Ripetizioni</label>
                    <input
                      type="text"
                      value={defaultReps}
                      onChange={(e) => setDefaultReps(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">RIR</label>
                    <input
                      type="number"
                      value={defaultRir}
                      onChange={(e) => setDefaultRir(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-purple-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">Recupero (s)</label>
                    <input
                      type="number"
                      value={defaultRestSec}
                      onChange={(e) => setDefaultRestSec(parseInt(e.target.value, 10) || 60)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingExerciseId ? 'Salva Modifiche' : 'Crea Esercizio in Catalogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD TO WORKOUT PROGRAM MODAL */}
      {quickAddExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Carica Esercizio in Scheda Atleta
                </h3>
                <p className="text-xs text-slate-500">
                  Inserisci "{quickAddExercise.name}" nel programma di {selectedAthlete.full_name}
                </p>
              </div>
              <button
                onClick={() => setQuickAddExercise(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmQuickAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Seleziona Scheda / Split Day di Destinazione *
                </label>
                <select
                  required
                  value={targetProgramId}
                  onChange={(e) => setTargetProgramId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  {athletePrograms.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.split_day} ({prog.mesocycle_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Prescription params */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block">Serie</label>
                  <input
                    type="number"
                    value={quickSets}
                    onChange={(e) => setQuickSets(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Reps</label>
                  <input
                    type="text"
                    value={quickReps}
                    onChange={(e) => setQuickReps(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">RIR</label>
                  <input
                    type="number"
                    value={quickRir}
                    onChange={(e) => setQuickRir(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-purple-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Rest (s)</label>
                  <input
                    type="number"
                    value={quickRest}
                    onChange={(e) => setQuickRest(parseInt(e.target.value, 10) || 60)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950">
                <span className="font-bold block text-[11px] mb-0.5">Note & Video Dimostrativo Ereditati:</span>
                <p className="text-[11px] text-purple-900 leading-relaxed truncate">
                  {quickAddExercise.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickAddExercise(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Conferma Inserimento in Scheda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL VIDEO TUTORIAL MODAL */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Play className="w-4 h-4 text-purple-400" />
                Video Dimostrativo: {activeVideoModal.name}
              </h3>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-black flex justify-center">
              <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-black">
                <iframe
                  src={activeVideoModal.url}
                  title={activeVideoModal.name}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <p className="text-slate-600 max-w-xl truncate">
                {activeVideoModal.description}
              </p>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
