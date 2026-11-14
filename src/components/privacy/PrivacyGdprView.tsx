/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Key,
} from 'lucide-react';

export const PrivacyGdprView: React.FC = () => {
  const {
    currentUser,
    gdprConsents,
    acceptGdprConsent,
    eraseAllAthleteData,
    exportAthleteData,
    auditLogs,
    setCurrentRoute,
    theme,
  } = useApp();

  const userConsent = gdprConsents.find((c) => c.athlete_id === currentUser.id);
  const [hasConsent, setHasConsent] = useState(() => !!userConsent?.art9_health_data_consent);

  const [confirmEraseModal, setConfirmEraseModal] = useState(false);
  const [eraseCompleted, setEraseCompleted] = useState(false);

  const handleToggleConsent = () => {
    if (!hasConsent) {
      acceptGdprConsent(currentUser.id);
      setHasConsent(true);
    }
  };

  const handleExecute1ClickErasure = () => {
    eraseAllAthleteData(currentUser.id);
    setConfirmEraseModal(false);
    setEraseCompleted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 space-y-6 sm:space-y-8 min-w-0">
      {/* Top Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
          Cyber Security & Conformità Normativa
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Centro Privacy & Conformità GDPR (Art. 7, 9, 17, 20)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Protezione crittografica per i dati biometrici, sanitari e foto progresso trattati nel coaching
        </p>
      </div>

      {eraseCompleted && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 text-xs space-y-2">
          <div className="font-bold text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Diritto all'Oblio (Art. 17 GDPR) Eseguito con Successo
          </div>
          <p className="text-emerald-800 leading-relaxed">
            Tutti i dati personali, storici giornalieri, check-in settimanali, file .FIT e fotografie dell'atleta <strong>{currentUser.full_name}</strong> sono stati rimossi in cascata (ON DELETE CASCADE) e cancellati dallo storage.
          </p>
        </div>
      )}

      {/* 1. Consenso Esplicito Dati Sanitari e Fisiologici (Art. 9 GDPR) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
            <h2 className="text-base font-bold text-slate-900">
              Consenso Esplicito al Trattamento Dati Sanitari (Art. 9 GDPR)
            </h2>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded ${
            hasConsent ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {hasConsent ? 'Consenso Concesso' : 'Consenso Mancante'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          I dati relativi al peso corporeo, frequenza cardiaca da Garmin, circonferenze, note su dolori articolari, digestione e foto del corpo costituiscono dati particolari relativi alla salute ai sensi dell'<strong>Articolo 9 del GDPR</strong>. La piattaforma ne consente il trattamento solo previo consenso libero, specifico e informato.
        </p>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-bold text-slate-900">
              Stato Consenso per: {currentUser.full_name} ({currentUser.email})
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              {userConsent
                ? `Registrato il ${new Date(userConsent.consent_timestamp).toLocaleDateString()} da IP ${userConsent.ip_address}`
                : 'Nessun record di consenso registrato.'}
            </div>
          </div>

          {!hasConsent && (
            <button
              onClick={handleToggleConsent}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors shrink-0"
            >
              Concedi Consenso Art. 9
            </button>
          )}
        </div>
      </div>

      {/* 2. Diritto alla Portabilità dei Dati (Art. 20 GDPR) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Download className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            Diritto alla Portabilità dei Dati (Art. 20 GDPR)
          </h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Puoi scaricare in qualsiasi momento una copia strutturata, leggibile da dispositivo automatico e interoperabile di tutti i tuoi dati registrati nel sistema.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={() => exportAthleteData('json')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Scarica Archivio Completo (JSON)
          </button>

          <button
            onClick={() => exportAthleteData('csv')}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Scarica Tabella Log Giornalieri (CSV)
          </button>
        </div>
      </div>

      {/* 3. Diritto all'Oblio (Art. 17 GDPR - 1-Click Complete Erasure) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
          <Trash2 className="w-5 h-5 text-rose-600" />
          <h2 className="text-base font-bold text-rose-950">
            Diritto all'Oblio & Cancellazione Totale (Art. 17 GDPR)
          </h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          La cancellazione totale rimuove istantaneamente e in modo irreversibile il tuo profilo, tutti i log giornalieri, tutti i check-in, i file .FIT importati e le foto progresso dai server di produzione e dallo storage cloud.
        </p>

        <button
          onClick={() => setConfirmEraseModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Richiedi Cancellazione Totale 1-Click
        </button>
      </div>

      {/* 4. Registro di Sicurezza e Audit Logs (TC-SEC-01) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-700" />
            <h2 className="text-base font-bold text-slate-900">Security Audit Logs (security_audit_logs)</h2>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
            Crittografia At-Rest Attiva
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Tipo Evento</th>
                <th className="px-4 py-3">Gravità</th>
                <th className="px-4 py-3">IP Client</th>
                <th className="px-4 py-3">Dettagli Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono-tabular text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {log.event_type}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      log.severity === 'ALERT'
                        ? 'bg-rose-100 text-rose-800'
                        : log.severity === 'WARN'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono-tabular text-slate-600">
                    {log.ip_address}
                  </td>
                  <td className="px-4 py-3 text-slate-600 truncate max-w-xs">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for 1-Click Erasure */}
      {confirmEraseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Confermi la cancellazione totale?</h3>
                <p className="text-xs text-rose-700">Azione irreversibile ai sensi dell'Art. 17 GDPR</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Questa operazione cancellerà istantaneamente il tuo profilo (<strong>{currentUser.full_name}</strong>), tutti i log del peso, i file .FIT Garmin e tutti i check-in inviati.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmEraseModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annulla
              </button>
              <button
                onClick={handleExecute1ClickErasure}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
              >
                Sì, Cancella Tutti i Miei Dati
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
