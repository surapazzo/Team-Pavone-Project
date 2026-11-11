/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  FileSpreadsheet,
  Lock,
  Send,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { landingContent, theme, setCurrentRoute } = useApp();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactGoal, setContactGoal] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 border-b border-slate-100 bg-gradient-to-b from-purple-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold text-purple-900 bg-purple-100/80 mb-6">
              <Zap className="w-3.5 h-3.5 text-purple-700" />
              <span>Metodo Scientifico di Coaching per Bodybuilding</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1] mb-6">
              {landingContent.hero_title}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
              {landingContent.hero_subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setCurrentRoute('/app/dashboard')}
                className="px-6 py-3.5 rounded-lg text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                style={{ backgroundColor: theme.accent_primary }}
              >
                {landingContent.hero_cta_text}
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#metodo"
                className="px-6 py-3.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
              >
                Scopri il Metodo
              </a>
            </div>

            {/* High-level credibility markers */}
            <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 text-slate-600 text-xs font-semibold">
              <div>
                <span className="block text-2xl font-black text-slate-900 font-mono-tabular">100%</span>
                <span>Approccio Basato sui Dati</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-slate-900 font-mono-tabular">7 Aree</span>
                <span>Check-In Analitico Settimanale</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-slate-900 font-mono-tabular">Garmin USB</span>
                <span>Sincronizzazione Diretta .FIT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Il Metodo di Francesco Pavone */}
      <section id="metodo" className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-3">
              I 4 Pilastri Operativi del Metodo
            </h2>
            <p className="text-sm text-slate-600">
              Nessuna stima casuale, nessun consiglio generico. Ogni scelta di carico, surplus o deficit è supportata da benchmark fisiologici calcolati in tempo reale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Macrociclo & Fasi Dinamiche
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pianificazione a 12+ settimane con mesocicli specialistici (Tensione Meccanica, Ipertrofia Sarcoplasmatica, AMPK, Deload programmato) e ciclizzazione calorica ON vs OFF.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Telemetria Garmin .FIT Nativa
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Importazione diretta da orologi Garmin via USB. Il parser binario decodifica battiti cardiaci medi/massimi, calorie attive, durata ed elimina l'inserimento manuale.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Check-In Guidato in 7 Aree
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sondaggio mobile-first con media peso 7gg automatica, upload foto progresso senza metadati EXIF, parametri di sonno, digestione, energia e video esecuzioni.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Privacy & Crittografia GDPR Art. 9
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dati sanitari e fisici protetti. Storage privato con Signed URLs temporanei (15 min), portabilità dati 1-click in JSON/CSV e diritto all'oblio completo.
              </p>
            </div>
          </div>

          {/* Coach Bio Card */}
          <div className="mt-16 bg-white p-8 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-purple-700 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-inner">
              FP
            </div>
            <div>
              <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
                Head Coach & Preparatore
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Francesco Pavone
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {landingContent.coach_bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bacheca Comunicazioni ed Articoli */}
      <section id="annunci" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-2">
                Bacheca Annunci & Aggiornamenti
              </h2>
              <p className="text-sm text-slate-600">
                Circolari tecniche, aggiornamenti metodologici e disposizioni per gli atleti attivi.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {landingContent.announcements.map((ann) => (
              <article
                key={ann.id}
                className="p-6 rounded-xl border border-slate-200/90 hover:border-purple-300 transition-colors bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs text-slate-600 mb-2 font-mono-tabular">
                    {ann.date}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ann.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Storie di Trasformazione */}
      <section id="trasformazioni" className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-3">
              Risultati Misurati e Tracciati nel Tempo
            </h2>
            <p className="text-sm text-slate-600">
              Cambiamenti di composizione corporea convalidati da dati oggettivi e aderenza costante.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {landingContent.testimonials.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-3">
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>{test.change_metric}</span>
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed mb-6">
                    "{test.text}"
                  </p>
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{test.athlete_name}</span>
                  <span className="text-[11px] text-slate-500 font-medium">Atleta Team Pavone</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Candidatura Coaching & Form */}
      <section id="contatti" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-2">
              Richiedi Candidatura Coaching
            </h2>
            <p className="text-sm text-slate-600">
              Compila il modulo per valutare il tuo profilo atletico e verificare la disponibilità di posti.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-xl text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-emerald-950 mb-2">Candidatura Ricevuta</h3>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                Grazie {contactName}! La tua richiesta è stata registrata. Francesco Pavone o uno dei collaboratori del team analizzerà i tuoi dati entro 48 ore.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-4 py-2 text-xs font-semibold text-emerald-900 bg-white rounded-lg border border-emerald-300 hover:bg-emerald-100/50"
              >
                Invia un'altra candidatura
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome e Cognome *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Mario Rossi"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="mario.rossi@example.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Obiettivo, Anzianità di Allenamento e Note
                </label>
                <textarea
                  rows={4}
                  value={contactGoal}
                  onChange={(e) => setContactGoal(e.target.value)}
                  placeholder="Es. Mi alleno da 3 anni, cerco supporto per preparazione gara Men's Physique 2026..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg text-white font-bold text-xs shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.accent_primary }}
              >
                <Send className="w-3.5 h-3.5" />
                Invia Candidatura a Francesco Pavone
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} {theme.brand_name} · Francesco Pavone Coaching Ecosystem. Tutti i diritti riservati.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentRoute('/app/privacy-gdpr')} className="hover:text-slate-900 transition-colors">
              Privacy Policy & GDPR
            </button>
            <button onClick={() => setCurrentRoute('/app/dashboard')} className="hover:text-slate-900 transition-colors font-semibold text-purple-700">
              Area Clienti
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
