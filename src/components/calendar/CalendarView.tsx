/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrainingPhaseType, NutritionPhaseType, EventPriorityType, MacrocycleWeek } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';

const TRAINING_PHASES: { value: TrainingPhaseType; label: string }[] = [
  { value: 'IPERTROFIA', label: 'Ipertrofia' },
  { value: 'FORZA', label: 'Forza Submassimale' },
  { value: 'DELOAD', label: 'Deload Programmato' },
  { value: 'METABOLICO', label: 'Metabolico / Lattacido' },
  { value: 'GPP', label: 'GPP (Preparazione Fisica Generale)' },
  { value: 'TENSIONE', label: 'Tensione Meccanica' },
  { value: 'IPERTROFIA_SARCO', label: 'Ipertrofia Sarcoplasmatica' },
  { value: 'NEURO', label: 'Attivazione Neurale' },
  { value: 'AMPK', label: 'Fase AMPK / Sensibilità Insulinica' },
  { value: 'HYPERDENSE', label: 'Hyperdense Density Training' },
  { value: 'CLUSTER', label: 'Cluster Sets Overload' },
  { value: 'HP_DOWNSETS', label: 'HP - Downsets' },
  { value: 'HP_STRAIGHT_SS', label: 'HP - Straight con SuperSet' },
];

const NUTRITION_PHASES: { value: NutritionPhaseType; label: string }[] = [
  { value: 'DEFICIT', label: 'Deficit Calorico' },
  { value: 'MAINTENANCE', label: 'Mantenimento Eucalorico' },
  { value: 'SURPLUS', label: 'Surplus (Bulk Controllato)' },
  { value: 'DIET_BREAK', label: 'Pausa Dieta / Reset Ormonale' },
  { value: 'REVERSE', label: 'Reverse Dieting' },
];

export const CalendarView: React.FC = () => {
  const {
    currentUser,
    macrocycleWeeks,
    updateMacrocycleWeek,
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    selectedAthlete,
    theme,
  } = useApp();

  const isCoach = currentUser.role === 'COACH';
  const targetAthlete = isCoach ? selectedAthlete : currentUser;

  // Filter weeks for target athlete
  const athleteWeeks = macrocycleWeeks
    .filter((w) => w.athlete_id === targetAthlete.id)
    .sort((a, b) => a.week_number - b.week_number);

  // Events for target athlete
  const athleteEvents = calendarEvents.filter((e) => e.athlete_id === targetAthlete.id);

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventPriority, setEventPriority] = useState<EventPriorityType>('LOW');
  const [eventNotes, setEventNotes] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;
    addCalendarEvent({
      athlete_id: targetAthlete.id,
      event_date: eventDate,
      title: eventTitle,
      priority: eventPriority,
      notes: eventNotes || undefined,
    });
    setEventTitle('');
    setEventNotes('');
    setIsEventModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 space-y-6 sm:space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
            {isCoach ? 'Programmazione Macro & Mesocicli (Coach)' : 'Macrociclo & Fasi (Atleta)'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isCoach ? `Macrocycle Spreadsheet Planner · ${targetAthlete.full_name}` : 'La Tua Periodizzazione a 12+ Settimane'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestione scientifica di carico, carboidrati nei giorni ON/OFF e benchmark fisiologici di variazione peso
          </p>
        </div>

        <button
          onClick={() => setIsEventModalOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
          style={{ backgroundColor: theme.accent_primary }}
        >
          <Plus className="w-3.5 h-3.5" />
          Segnala Evento Futuro
        </button>
      </div>

      {/* Benchmark Rules Card (Agente 4 Bodybuilding Logic) */}
      <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200/80 text-xs">
        <div className="flex items-center gap-2 font-bold text-purple-950 mb-2">
          <Zap className="w-4 h-4 text-purple-700" />
          <span>Benchmark Fisiologici Attivi per {targetAthlete.full_name} ({targetAthlete.experience_level})</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-slate-700 leading-relaxed">
          <div>
            <span className="font-semibold text-slate-900">Fase di Deficit:</span> Perdita peso ideale tra <strong>0.5% e 1.5%</strong> del peso a settimana. Preserva il tessuto contrattile ed evita il catabolismo.
          </div>
          <div>
            <span className="font-semibold text-slate-900">Fase di Surplus (Bulk):</span> Aumento mensile modulato per anzianità di allenamento (<strong>0.5% – 1.0%/mese</strong> per 2-4 anni di anzianità).
          </div>
        </div>
      </div>

      {/* Coach Macrocycle Spreadsheet Planner vs Athlete Timeline */}
      {isCoach ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Macrocycle High-Density Spreadsheet Planner</h2>
              <p className="text-xs text-slate-500">
                Griglia editabile in-place per assegnare fasi di allenamento e nutrienti settimana su settimana
              </p>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded">
              Modifica Live Attiva
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3">Settimana</th>
                  <th className="px-3 py-3">Fase Allenamento</th>
                  <th className="px-3 py-3">Fase Nutrizione</th>
                  <th className="px-3 py-3">Kcal ON / OFF</th>
                  <th className="px-3 py-3">Carboidrati (g)</th>
                  <th className="px-3 py-3">Proteine / Grassi</th>
                  <th className="px-3 py-3">Passi Target</th>
                  <th className="px-3 py-3">Prescrizione Cardio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {athleteWeeks.map((week) => (
                  <tr key={week.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-3 font-bold text-purple-900 font-mono-tabular">
                      {week.iso_week}
                    </td>

                    {/* Training Phase Selector */}
                    <td className="px-3 py-3">
                      <select
                        value={week.training_phase}
                        onChange={(e) =>
                          updateMacrocycleWeek(week.id, { training_phase: e.target.value as TrainingPhaseType })
                        }
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-purple-600 font-medium"
                      >
                        {TRAINING_PHASES.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Nutrition Phase Selector */}
                    <td className="px-3 py-3">
                      <select
                        value={week.nutrition_phase}
                        onChange={(e) =>
                          updateMacrocycleWeek(week.id, { nutrition_phase: e.target.value as NutritionPhaseType })
                        }
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-purple-600 font-medium"
                      >
                        {NUTRITION_PHASES.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Kcal ON / OFF */}
                    <td className="px-3 py-3 font-mono-tabular">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={week.target_kcal_on}
                          onChange={(e) =>
                            updateMacrocycleWeek(week.id, { target_kcal_on: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-xs text-orange-600 font-bold"
                          title="Kcal Giorno ON"
                        />
                        <span className="text-slate-400">/</span>
                        <input
                          type="number"
                          value={week.target_kcal_off}
                          onChange={(e) =>
                            updateMacrocycleWeek(week.id, { target_kcal_off: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-xs text-slate-700 font-bold"
                          title="Kcal Giorno OFF"
                        />
                      </div>
                    </td>

                    {/* Carbs ON / OFF */}
                    <td className="px-3 py-3 font-mono-tabular">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={week.target_carbs_on_g}
                          onChange={(e) =>
                            updateMacrocycleWeek(week.id, { target_carbs_on_g: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-xs"
                          title="Carbo ON (g)"
                        />
                        <span className="text-slate-400">/</span>
                        <input
                          type="number"
                          value={week.target_carbs_off_g}
                          onChange={(e) =>
                            updateMacrocycleWeek(week.id, { target_carbs_off_g: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-xs"
                          title="Carbo OFF (g)"
                        />
                      </div>
                    </td>

                    {/* Protein / Fats */}
                    <td className="px-3 py-3 font-mono-tabular">
                      <span className="font-semibold text-slate-800">{week.target_protein_g}g P</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="font-semibold text-slate-800">{week.target_fats_g}g F</span>
                    </td>

                    {/* Steps */}
                    <td className="px-3 py-3 font-mono-tabular">
                      <input
                        type="number"
                        value={week.target_steps_daily}
                        onChange={(e) =>
                          updateMacrocycleWeek(week.id, { target_steps_daily: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-20 px-1.5 py-0.5 border border-slate-300 rounded text-xs font-semibold"
                      />
                    </td>

                    {/* Cardio */}
                    <td className="px-3 py-3 max-w-[200px]">
                      <input
                        type="text"
                        value={week.cardio_prescription}
                        onChange={(e) =>
                          updateMacrocycleWeek(week.id, { cardio_prescription: e.target.value })
                        }
                        className="w-full px-2 py-0.5 border border-slate-300 rounded text-xs truncate"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Athlete Timeline View */
        <div className="grid md:grid-cols-2 gap-6">
          {athleteWeeks.map((week, idx) => (
            <div
              key={week.id}
              className={`p-6 rounded-2xl border transition-all ${
                idx === 1
                  ? 'bg-purple-50/40 border-purple-300 shadow-md ring-1 ring-purple-400/30'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-purple-900 font-mono-tabular text-sm">
                    {week.iso_week}
                  </span>
                  {idx === 1 && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-700 text-white">
                      Settimana Corrente
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {week.training_phase}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Nutrizione ON vs OFF */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Nutrizione: {week.nutrition_phase}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-bold text-orange-600 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> Giorno ON (Workout)
                      </div>
                      <div className="text-base font-black text-slate-900 font-mono-tabular mt-0.5">
                        {week.target_kcal_on} <span className="text-xs font-normal">kcal</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {week.target_carbs_on_g}g C · {week.target_protein_g}g P · {week.target_fats_g}g F
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Giorno OFF (Riposo)
                      </div>
                      <div className="text-base font-black text-slate-900 font-mono-tabular mt-0.5">
                        {week.target_kcal_off} <span className="text-xs font-normal">kcal</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {week.target_carbs_off_g}g C · {week.target_protein_g}g P · {week.target_fats_g}g F
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attività e Cardio */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">Passi Minimi Giornalieri</span>
                    <span className="font-extrabold text-slate-900 font-mono-tabular text-sm">
                      {week.target_steps_daily.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">Prescrizione Cardio</span>
                    <span className="font-semibold text-slate-800 text-[11px] truncate block">
                      {week.cardio_prescription}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Eventi Futuri nel Calendario (Bassa / Alta Priorità) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-purple-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Eventi Segnalati per la Pianificazione</h2>
              <p className="text-xs text-slate-500">
                Viaggi, ferie o cene comunicati per consentire a Francesco di rimodulare carichi e calorie in anticipo
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="text-xs text-purple-700 font-semibold hover:text-purple-900 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Aggiungi Evento
          </button>
        </div>

        {athleteEvents.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {athleteEvents.map((evt) => (
              <div
                key={evt.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  evt.priority === 'HIGH'
                    ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs">{evt.title}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                      evt.priority === 'HIGH' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {evt.priority === 'HIGH' ? 'Alta Priorità' : 'Bassa Priorità'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono-tabular mb-1">
                    Data: {evt.event_date}
                  </div>
                  {evt.notes && (
                    <div className="text-xs text-slate-600 italic">
                      "{evt.notes}"
                    </div>
                  )}
                </div>

                <button
                  onClick={() => deleteCalendarEvent(evt.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  title="Elimina evento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
            Nessun evento futuro segnalato. Clicca su "Segnala Evento Futuro" per indicare viaggi o assenze.
          </div>
        )}
      </div>

      {/* Modal Segnalazione Evento */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Segnala Evento Futuro nel Calendario</h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titolo Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="es. Viaggio di lavoro, Compleanno, Chiusura palestra..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Livello di Priorità</label>
                  <select
                    value={eventPriority}
                    onChange={(e) => setEventPriority(e.target.value as EventPriorityType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="LOW">Bassa Priorità (Cena, Compleanno)</option>
                    <option value="HIGH">Alta Priorità (Ferie, Assenza Palestra, Infortunio)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note Aggiuntive per il Coach</label>
                <textarea
                  rows={3}
                  placeholder="es. Disponibilità attrezzi in hotel o preferenze per compensare..."
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white rounded-lg shadow-sm"
                  style={{ backgroundColor: theme.accent_primary }}
                >
                  Salva nel Calendario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
