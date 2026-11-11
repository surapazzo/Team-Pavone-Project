/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkoutProgram, ExerciseItem, ExerciseVideo } from '../../types';
import { TUTORIAL_VIDEOS_LIBRARY } from '../../data/initialData';
import {
  Dumbbell,
  Play,
  Upload,
  Plus,
  Copy,
  CheckCircle2,
  Utensils,
  BookOpen,
  X,
  ExternalLink,
} from 'lucide-react';

export const WorkoutsView: React.FC = () => {
  const {
    currentUser,
    selectedAthlete,
    workoutPrograms,
    saveWorkoutProgram,
    theme,
  } = useApp();

  const isCoach = currentUser.role === 'COACH';
  const targetAthlete = isCoach ? selectedAthlete : currentUser;

  const athletePrograms = workoutPrograms.filter((p) => p.athlete_id === targetAthlete.id);
  const [activeProgramId, setActiveProgramId] = useState<string>(() => athletePrograms[0]?.id || '');

  const activeProgram = athletePrograms.find((p) => p.id === activeProgramId) || athletePrograms[0];

  // Video tutorial modal state
  const [selectedTutorialVideo, setSelectedTutorialVideo] = useState<{ name: string; url: string; notes?: string } | null>(null);

  // Upload video modal state
  const [uploadModalExercise, setUploadModalExercise] = useState<string | null>(null);
  const [uploadVideoUrl, setUploadVideoUrl] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(false);

  // Coach workout builder states
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [newSplitDay, setNewSplitDay] = useState('');
  const [newMesocycleName, setNewMesocycleName] = useState('Mesociclo 4 - Overload');
  const [newExercises, setNewExercises] = useState<ExerciseItem[]>([
    { id: 'ex-new-1', name: 'Incline Dumbbell Press', sets: 4, reps: '6-8', rir: 1, rest_sec: 120, notes: 'Focus petto alto', video_url: 'https://www.youtube.com/embed/8iPEnn-ltC8' },
  ]);

  const handleUploadExecutionVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadVideoUrl || !uploadModalExercise) return;
    setUploadSuccessMsg(true);
    setTimeout(() => {
      setUploadSuccessMsg(false);
      setUploadModalExercise(null);
      setUploadVideoUrl('');
    }, 2000);
  };

  const handleCloneProgram = (source: WorkoutProgram) => {
    const cloned: WorkoutProgram = {
      ...source,
      id: `prog-${Date.now()}`,
      title: `${source.title} (Copia)`,
      split_day: `${source.split_day} - Modificato`,
      exercises: source.exercises.map((e) => ({ ...e, id: `ex-${Date.now()}-${Math.random()}` })),
    };
    saveWorkoutProgram(cloned);
    setActiveProgramId(cloned.id);
  };

  const handleSaveNewProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSplitDay) return;
    const newProg: WorkoutProgram = {
      id: `prog-${Date.now()}`,
      athlete_id: targetAthlete.id,
      title: `Programma Personalizzato - ${targetAthlete.full_name}`,
      mesocycle_name: newMesocycleName,
      split_day: newSplitDay,
      exercises: newExercises,
      active: true,
    };
    saveWorkoutProgram(newProg);
    setIsBuilderOpen(false);
    setActiveProgramId(newProg.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
            {isCoach ? 'Console Allenamento & Nutrizione (Coach)' : 'Scheda di Allenamento & Dieta (Atleta)'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isCoach ? `Program & Diet Console · ${targetAthlete.full_name}` : 'Scheda Interattiva & Piano Nutrizionale'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Buffer di carico RIR, player video tutorial nativo e feedback di esecuzione 1-on-1
          </p>
        </div>

        {isCoach && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBuilderOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              style={{ backgroundColor: theme.accent_primary }}
            >
              <Plus className="w-3.5 h-3.5" />
              Crea Nuova Scheda
            </button>
          </div>
        )}
      </div>

      {/* Split Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {athletePrograms.map((prog) => (
          <button
            key={prog.id}
            onClick={() => setActiveProgramId(prog.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              (activeProgram && activeProgram.id === prog.id)
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>{prog.split_day}</span>
          </button>
        ))}

        {isCoach && activeProgram && (
          <button
            onClick={() => handleCloneProgram(activeProgram)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 ml-auto"
            title="Clona questa scheda per un altro giorno o atleta"
          >
            <Copy className="w-3.5 h-3.5" /> Clona Scheda
          </button>
        )}
      </div>

      {/* Active Workout Program Card */}
      {activeProgram ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">
                {activeProgram.mesocycle_name}
              </span>
              <h2 className="text-lg font-bold text-slate-900">{activeProgram.split_day}</h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-800 rounded-md">
              {activeProgram.exercises.length} Esercizi Programmati
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {activeProgram.exercises.map((ex, idx) => (
              <div key={ex.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center font-mono-tabular">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{ex.name}</h3>
                  </div>

                  {ex.notes && (
                    <p className="text-xs text-slate-600 leading-relaxed pl-8">
                      {ex.notes}
                    </p>
                  )}
                </div>

                {/* Exercise Parameters (Sets, Reps, RIR, Rest) */}
                <div className="flex flex-wrap items-center gap-6 text-xs pl-8 lg:pl-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Serie × Ripetizioni</span>
                    <span className="font-extrabold text-slate-900 text-sm font-mono-tabular">
                      {ex.sets} × {ex.reps}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">RIR (Buffer)</span>
                    <span className="font-bold text-purple-700 text-sm font-mono-tabular">
                      {ex.rir} RIR
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Recupero</span>
                    <span className="font-semibold text-slate-700 font-mono-tabular">
                      {ex.rest_sec}s
                    </span>
                  </div>

                  {/* Actions: View Tutorial Video & Upload Execution */}
                  <div className="flex items-center gap-2">
                    {ex.video_url && (
                      <button
                        onClick={() => setSelectedTutorialVideo({ name: ex.name, url: ex.video_url!, notes: ex.notes })}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" /> Tutorial
                      </button>
                    )}

                    <button
                      onClick={() => setUploadModalExercise(ex.name)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Carica Video Esecuzione
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
          Nessuna scheda attiva trovata per questo atleta.
        </div>
      )}

      {/* Active Nutrition Plan Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Utensils className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Piano Alimentare Attivo & Suddivisione Macros</h2>
              <p className="text-xs text-slate-500">
                Calcolato per preservare glicogeno muscolare e massimizzare la performance sui fondamentali
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
            Prescrizione Pavone Attiva
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 text-xs">
            <span className="text-[10px] text-orange-700 font-bold block mb-1 uppercase">Giorno ON (Allenamento)</span>
            <div className="text-xl font-black text-orange-950 font-mono-tabular">2,300 kcal</div>
            <div className="text-slate-600 mt-2 space-y-0.5">
              <div>Carboidrati: <strong>310g</strong> (alto glicogeno)</div>
              <div>Proteine: <strong>185g</strong> (2.3g/kg)</div>
              <div>Grassi: <strong>50g</strong> (profilo essenziale)</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-500 font-bold block mb-1 uppercase">Giorno OFF (Riposo)</span>
            <div className="text-xl font-black text-slate-900 font-mono-tabular">2,100 kcal</div>
            <div className="text-slate-600 mt-2 space-y-0.5">
              <div>Carboidrati: <strong>220g</strong> (sensibilità insulinica)</div>
              <div>Proteine: <strong>185g</strong> (stabile)</div>
              <div>Grassi: <strong>55g</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs">
            <span className="text-[10px] text-purple-700 font-bold block mb-1 uppercase">Domenica Ricarica (High Carb)</span>
            <div className="text-xl font-black text-purple-950 font-mono-tabular">3,100 kcal</div>
            <div className="text-slate-600 mt-2 space-y-0.5">
              <div>Carboidrati: <strong>450g</strong> (priming ormonale)</div>
              <div>Proteine: <strong>160g</strong></div>
              <div>Grassi: <strong>35g</strong> (minimi per limitare lipogenesi)</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-1 uppercase">Idratazione & Integratori</span>
              <p className="text-slate-600 leading-relaxed">
                Minimo 3.5 litri acqua/die + 5g creatina monoidrato post workout + multivitaminico & Omega-3 a colazione.
              </p>
            </div>
            <span className="text-[11px] text-purple-700 font-semibold mt-2">Zero integratori inutili</span>
          </div>
        </div>
      </div>

      {/* Video Tutorial Modal (Native Player) */}
      {selectedTutorialVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-purple-700" />
                Video Tutorial: {selectedTutorialVideo.name}
              </h3>
              <button
                onClick={() => setSelectedTutorialVideo(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Native Responsive Video Embed */}
            <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-inner">
              <iframe
                src={selectedTutorialVideo.url}
                title={selectedTutorialVideo.name}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {selectedTutorialVideo.notes && (
              <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-900">
                <strong>Punti Tecnici Chiave:</strong> {selectedTutorialVideo.notes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Execution Video Modal */}
      {uploadModalExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Carica Video Esecuzione ({uploadModalExercise})
              </h3>
              <button
                onClick={() => setUploadModalExercise(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            {uploadSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-900">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                Video caricato e collegato all'esercizio! Francesco Pavone riceverà notifica per il video review.
              </div>
            ) : (
              <form onSubmit={handleUploadExecutionVideo} className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Incolla il link video (YouTube non in elenco, Google Drive, Loom o video firmato privato) per consentire al coach di valutare ROM, stabilità e traiettoria.
                </p>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link Video Tutorial/Esecuzione *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={uploadVideoUrl}
                    onChange={(e) => setUploadVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setUploadModalExercise(null)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold text-white rounded-lg shadow-sm"
                    style={{ backgroundColor: theme.accent_primary }}
                  >
                    Salva ed Invia a Francesco
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Coach Program Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Builder Scheda di Allenamento (Coach)</h3>
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewProgram} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome Split Day *</label>
                  <input
                    type="text"
                    required
                    placeholder="es. Giorno C - Dorso & Deltoidi"
                    value={newSplitDay}
                    onChange={(e) => setNewSplitDay(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome Mesociclo</label>
                  <input
                    type="text"
                    value={newMesocycleName}
                    onChange={(e) => setNewMesocycleName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700">Esercizi del Workout ({newExercises.length})</span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewExercises([
                        ...newExercises,
                        {
                          id: `ex-${Date.now()}`,
                          name: 'Nuovo Esercizio',
                          sets: 3,
                          reps: '8-10',
                          rir: 1,
                          rest_sec: 90,
                          notes: 'Focus contrazione',
                        },
                      ])
                    }
                    className="text-purple-700 font-semibold hover:text-purple-900 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Aggiungi Esercizio
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {newExercises.map((ex, idx) => (
                    <div key={ex.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => {
                            const copy = [...newExercises];
                            copy[idx].name = e.target.value;
                            setNewExercises(copy);
                          }}
                          className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setNewExercises(newExercises.filter((_, i) => i !== idx))}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Serie</label>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => {
                              const copy = [...newExercises];
                              copy[idx].sets = parseInt(e.target.value, 10) || 1;
                              setNewExercises(copy);
                            }}
                            className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Reps</label>
                          <input
                            type="text"
                            value={ex.reps}
                            onChange={(e) => {
                              const copy = [...newExercises];
                              copy[idx].reps = e.target.value;
                              setNewExercises(copy);
                            }}
                            className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">RIR</label>
                          <input
                            type="number"
                            value={ex.rir}
                            onChange={(e) => {
                              const copy = [...newExercises];
                              copy[idx].rir = parseInt(e.target.value, 10) || 0;
                              setNewExercises(copy);
                            }}
                            className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Rest (sec)</label>
                          <input
                            type="number"
                            value={ex.rest_sec}
                            onChange={(e) => {
                              const copy = [...newExercises];
                              copy[idx].rest_sec = parseInt(e.target.value, 10) || 60;
                              setNewExercises(copy);
                            }}
                            className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white rounded-lg shadow-sm"
                  style={{ backgroundColor: theme.accent_primary }}
                >
                  Salva Scheda per {targetAthlete.full_name}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
