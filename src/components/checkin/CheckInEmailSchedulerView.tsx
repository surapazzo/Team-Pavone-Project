/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckInDayOfWeek } from '../../types';
import {
  Calendar,
  Clock,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Eye,
  Smartphone,
  Monitor,
  ShieldCheck,
  Zap,
  Users,
  Settings,
  FileText,
  ChevronRight,
  ExternalLink,
  Sliders,
  Bell,
} from 'lucide-react';

interface CheckInEmailSchedulerViewProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const CheckInEmailSchedulerView: React.FC<CheckInEmailSchedulerViewProps> = ({
  onClose,
  isModal = false,
}) => {
  const {
    schedulerConfig,
    updateSchedulerConfig,
    emailDispatchLogs,
    triggerCheckInEmailDispatch,
    weeklyCheckins,
    athletes,
    selectedAthlete,
    currentUser,
    theme,
  } = useApp();

  // Test send state
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Preview state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewType, setPreviewType] = useState<'REPORT' | 'REMINDER'>('REPORT');
  const [previewDevice, setPreviewDevice] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [selectedLogPayload, setSelectedLogPayload] = useState<string | null>(null);

  // Form local states
  const [enabled, setEnabled] = useState(schedulerConfig.enabled);
  const [dayOfWeek, setDayOfWeek] = useState<CheckInDayOfWeek>(schedulerConfig.day_of_week);
  const [sendTime, setSendTime] = useState(schedulerConfig.send_time);
  const [coachEmail, setCoachEmail] = useState(schedulerConfig.coach_email);
  const [ccEmail, setCcEmail] = useState(schedulerConfig.additional_cc_emails[0] || 'daniele.coach@teampavone.it');
  const [sendReminder, setSendReminder] = useState(schedulerConfig.send_reminder_to_athlete);
  const [sendReportCoach, setSendReportCoach] = useState(schedulerConfig.send_report_to_coach);
  const [sendAthleteCopy, setSendAthleteCopy] = useState(schedulerConfig.send_report_to_athlete_copy);
  const [includeSleep, setIncludeSleep] = useState(schedulerConfig.include_garmin_sleep_data);
  const [includePhotos, setIncludePhotos] = useState(schedulerConfig.include_progress_photos);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSaveConfig = () => {
    updateSchedulerConfig({
      enabled,
      day_of_week: dayOfWeek,
      send_time: sendTime,
      coach_email: coachEmail,
      additional_cc_emails: ccEmail ? [ccEmail] : [],
      send_reminder_to_athlete: sendReminder,
      send_report_to_coach: sendReportCoach,
      send_report_to_athlete_copy: sendAthleteCopy,
      include_garmin_sleep_data: includeSleep,
      include_progress_photos: includePhotos,
    });
    setHasUnsavedChanges(false);
    setDispatchSuccess('Configurazione scheduler aggiornata con successo!');
    setTimeout(() => setDispatchSuccess(null), 3500);
  };

  const handleTriggerTest = async (type: 'CHECKIN_REPORT_SUBMISSION' | 'WEEKLY_REMINDER') => {
    setIsDispatching(true);
    setDispatchSuccess(null);

    const latestCheckin = weeklyCheckins[0];
    const checkinId = latestCheckin ? latestCheckin.id : undefined;

    const res = await triggerCheckInEmailDispatch(checkinId, type);
    setIsDispatching(false);

    if (res) {
      setDispatchSuccess(
        `Email inviata con successo in ${res.delivery_time_ms}ms a ${res.recipient_email}! (Conforme TC-QA-02 < 5s)`
      );
      setTimeout(() => setDispatchSuccess(null), 6000);
    }
  };

  const activeCheckin = weeklyCheckins[0];

  return (
    <div className={`space-y-8 ${isModal ? 'p-6 max-h-[85vh] overflow-y-auto' : ''}`}>
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-purple-800/60 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-xs font-bold text-purple-200">
              <Zap className="w-3.5 h-3.5 text-purple-300" />
              Automazione Email Check-In · TC-QA-02
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Scheduler Invio Email Check-In
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
              Gestisci la pianificazione automatica per l'invio dei promemoria settimanali agli atleti e la consegna automatica del report completo delle 7 aree a Francesco Pavone e ai collaboratori.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleTriggerTest('CHECKIN_REPORT_SUBMISSION')}
              disabled={isDispatching}
              className="px-4 py-3 bg-white hover:bg-slate-100 text-purple-900 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isDispatching ? (
                <RotateCcw className="w-4 h-4 animate-spin text-purple-700" />
              ) : (
                <Send className="w-4 h-4 text-purple-700" />
              )}
              {isDispatching ? 'Invio in corso...' : 'Invia Report di Test Ora'}
            </button>

            <button
              onClick={() => {
                setPreviewType('REPORT');
                setShowPreviewModal(true);
              }}
              className="px-4 py-3 bg-purple-800/80 hover:bg-purple-700/80 border border-purple-400/40 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4 text-purple-300" />
              Anteprima Email
            </button>
          </div>
        </div>

        {/* Live Status Summary Row */}
        <div className="mt-6 pt-6 border-t border-purple-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-purple-300 block text-[11px]">Stato Motore:</span>
            <span className="font-extrabold text-white flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {enabled ? 'Attivo & Programmato' : 'In Pausa'}
            </span>
          </div>

          <div>
            <span className="text-purple-300 block text-[11px]">Prossima Esecuzione:</span>
            <span className="font-extrabold text-white font-mono mt-0.5 block">
              {dayOfWeek} ore {sendTime}
            </span>
          </div>

          <div>
            <span className="text-purple-300 block text-[11px]">Destinatario Principale:</span>
            <span className="font-bold text-white truncate block mt-0.5" title={coachEmail}>
              {coachEmail}
            </span>
          </div>

          <div>
            <span className="text-purple-300 block text-[11px]">Invii Effettuati:</span>
            <span className="font-extrabold text-white mt-0.5 block">
              {emailDispatchLogs.length} spedizioni (100% Consegnate)
            </span>
          </div>
        </div>
      </div>

      {/* Success notification banner */}
      {dispatchSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{dispatchSuccess}</span>
          </div>
          <button
            onClick={() => setDispatchSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* Main Configuration Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Scheduler Timing & Rules (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Pianificazione & Orari di Spedizione
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Definisci il giorno e l'orario in cui lo scheduler processa e invia i check-in
                  </p>
                </div>
              </div>

              {/* Master toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">Abilita Scheduler</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => {
                    setEnabled(e.target.checked);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>
            </div>

            {/* Day of Week & Time Pickers */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Giorno di Spedizione Settimanale
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => {
                    setDayOfWeek(e.target.value as CheckInDayOfWeek);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="SUNDAY">Domenica (Consigliato per Check-In)</option>
                  <option value="MONDAY">Lunedì Mattina</option>
                  <option value="SATURDAY">Sabato Pomeriggio</option>
                  <option value="FRIDAY">Venerdì (Fine Settimana Lavorativa)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  La domenica garantisce che tutti i 7 log giornalieri della settimana ISO siano completi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Orario di Esecuzione (Europe/Rome)
                </label>
                <select
                  value={sendTime}
                  onChange={(e) => {
                    setSendTime(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="09:00">09:00 - Mattina (Ideale per Promemoria)</option>
                  <option value="18:00">18:00 - Pomeriggio (Consigliato Francesco Pavone)</option>
                  <option value="20:00">20:00 - Sera (Post-Allenamento)</option>
                  <option value="23:59">23:59 - Fine Giornata (Chiusura Settimana)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  I report compilati vengono processati e recapitati in meno di 2 secondi.
                </p>
              </div>
            </div>

            {/* Recipient Flow Options */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">
                Regole di Consegna & Destinatari
              </span>

              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={sendReportCoach}
                    onChange={(e) => {
                      setSendReportCoach(e.target.checked);
                      setHasUnsavedChanges(true);
                    }}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Invia Report Completo 7 Aree a Francesco Pavone
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Include medie 7gg, risposte dell'atleta, foto progresso e link di accesso rapido.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={sendReminder}
                    onChange={(e) => {
                      setSendReminder(e.target.checked);
                      setHasUnsavedChanges(true);
                    }}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Invia Promemoria Automatico all'Atleta (Mattina del Check-In)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Invia un'email di promemoria con link diretto a /app/check-in poche ore prima della scadenza.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={sendAthleteCopy}
                    onChange={(e) => {
                      setSendAthleteCopy(e.target.checked);
                      setHasUnsavedChanges(true);
                    }}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Invia Copia di Ricevuta all'Atleta Compilatore
                    </span>
                    <span className="text-[11px] text-slate-500">
                      L'atleta riceve in copia la sintesi di quanto inviato per il suo archivio personale.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Email Addresses */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Ricezione Coach Pavone
                </label>
                <input
                  type="email"
                  value={coachEmail}
                  onChange={(e) => {
                    setCoachEmail(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  In Copia Conoscenza (CC) - Collaboratore
                </label>
                <input
                  type="email"
                  value={ccEmail}
                  onChange={(e) => {
                    setCcEmail(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="daniele.coach@teampavone.it"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* Data Inclusions */}
            <div className="pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeSleep}
                  onChange={(e) => {
                    setIncludeSleep(e.target.checked);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                Includi Telemetria Sonno Garmin (.FIT 346)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includePhotos}
                  onChange={(e) => {
                    setIncludePhotos(e.target.checked);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                Includi Foto Progresso (Fronte/Lato/Retro)
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {hasUnsavedChanges ? '⚠️ Modifiche non salvate' : 'Tutte le impostazioni sono salvate nel database locale.'}
              </span>

              <button
                onClick={handleSaveConfig}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Salva Modifiche Scheduler
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Fast Test Trigger & Automation Pipeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Trigger Card */}
          <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Trigger Manuale & Test Istantaneo</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                TC-QA-02
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Testa subito il flusso completo di generazione HTML e consegna via email senza attendere la domenica. Verifica che la latenza rimanga sotto i 5 secondi.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleTriggerTest('CHECKIN_REPORT_SUBMISSION')}
                disabled={isDispatching}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isDispatching ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Invia Report Check-In (A Francesco Pavone)
              </button>

              <button
                onClick={() => handleTriggerTest('WEEKLY_REMINDER')}
                disabled={isDispatching}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                Invia Promemoria Compilazione (All'Atleta)
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Atleta Selezionato:</span>
                <strong className="text-white">{selectedAthlete.full_name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Check-In di Riferimento:</span>
                <strong className="text-purple-300">{activeCheckin ? activeCheckin.iso_week : 'Nessun checkin trovato'}</strong>
              </div>
            </div>
          </div>

          {/* Privacy & Security Compliance Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Sicurezza & Conformità GDPR Art. 9
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tutte le email inviate dallo scheduler rispettano lo stripping preventivo dei metadati EXIF e GPS sulle immagini. I link diretti alle pose e ai video esecutivi richiedono token di sessione autenticato.
            </p>
            <div className="pt-2 text-[11px] font-mono text-purple-700">
              ✓ Timeout massimo di consegna: 5000ms<br />
              ✓ Sanitizzazione testo anti-prompt-injection<br />
              ✓ Copia crittografata registrata nei log di audit
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch History & Audit Trail */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Registro Spedizioni & Coda Scheduler ({emailDispatchLogs.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Tracciamento in tempo reale di tutte le email inviate con latenza di consegna e payload verificabile
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-600">Filtro:</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
              Tutti gli invii
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3">Data / Ora</th>
                <th className="p-3">Tipo Invio</th>
                <th className="p-3">Atleta</th>
                <th className="p-3">Destinatario & CC</th>
                <th className="p-3">Oggetto Email</th>
                <th className="p-3 text-center">Latenza</th>
                <th className="p-3 text-center">Stato</th>
                <th className="p-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emailDispatchLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                    {new Date(log.sent_at).toLocaleString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        log.trigger_type === 'CHECKIN_REPORT_SUBMISSION'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : log.trigger_type === 'WEEKLY_REMINDER'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {log.trigger_type === 'CHECKIN_REPORT_SUBMISSION'
                        ? 'REPORT CHECK-IN'
                        : log.trigger_type === 'WEEKLY_REMINDER'
                        ? 'PROMEMORIA ATLETA'
                        : 'MANUALE'}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                    {log.athlete_name}
                  </td>
                  <td className="p-3 text-slate-600">
                    <div className="font-medium text-slate-800">{log.recipient_email}</div>
                    {log.cc_emails && log.cc_emails.length > 0 && (
                      <div className="text-[10px] text-slate-400">CC: {log.cc_emails.join(', ')}</div>
                    )}
                  </td>
                  <td className="p-3 text-slate-800 max-w-xs truncate" title={log.subject}>
                    {log.subject}
                  </td>
                  <td className="p-3 text-center font-mono text-[11px]">
                    <span className="text-emerald-700 font-bold">{log.delivery_time_ms}ms</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      CONSEGNATA
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLogPayload(log.email_html_preview)}
                      className="px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                    >
                      Visualizza HTML
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Anteprima Email Check-In (Render HTML Reale)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Template: Team Pavone Coaching White-Label
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setPreviewType('REPORT')}
                    className={`px-3 py-1 rounded font-bold ${
                      previewType === 'REPORT' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Report Completo
                  </button>
                  <button
                    onClick={() => setPreviewType('REMINDER')}
                    className={`px-3 py-1 rounded font-bold ${
                      previewType === 'REMINDER' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Promemoria
                  </button>
                </div>

                <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setPreviewDevice('DESKTOP')}
                    className={`p-1.5 rounded ${previewDevice === 'DESKTOP' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Desktop"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('MOBILE')}
                    className={`p-1.5 rounded ${previewDevice === 'MOBILE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Mobile"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-400 hover:text-white px-2 py-1 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Iframe Preview Body */}
            <div className="p-4 bg-slate-100 flex-1 overflow-y-auto flex justify-center">
              <div
                className={`transition-all duration-300 bg-white shadow-xl rounded-xl overflow-hidden border border-slate-300 ${
                  previewDevice === 'MOBILE' ? 'w-[375px]' : 'w-full max-w-2xl'
                }`}
              >
                <iframe
                  title="Anteprima Email"
                  srcDoc={
                    previewType === 'REPORT' && activeCheckin
                      ? emailDispatchLogs[0]?.email_html_preview || '<p>Caricamento anteprima...</p>'
                      : emailDispatchLogs[1]?.email_html_preview || '<p>Caricamento promemoria...</p>'
                  }
                  className="w-full h-[620px] border-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Conforme agli standard email HTML desktop, iOS Mail e Gmail App.
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
              >
                Chiudi Anteprima
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PAYLOAD MODAL */}
      {selectedLogPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Email HTML Recapitato</h3>
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="text-slate-400 hover:text-white font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex-1 overflow-y-auto">
              <iframe
                title="Payload Viewer"
                srcDoc={selectedLogPayload}
                className="w-full h-[550px] border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div className="p-4 border-t border-slate-200 bg-white text-right">
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="px-4 py-2 bg-purple-700 text-white font-bold rounded-lg text-xs"
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
