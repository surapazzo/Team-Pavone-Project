/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  Send,
  Zap,
  Edit3,
  Dumbbell,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  onOpenCmsModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenCmsModal }) => {
  const { landingContent, currentUser, setCurrentRoute, theme, setIsCookieModalOpen, setIsOnboardingModalOpen } = useApp();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactGoal, setContactGoal] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    setSubmitted(true);
  };

  const isCoach = currentUser.role === 'COACH';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* If Coach: Floating CMS Quick Action */}
      {isCoach && onOpenCmsModal && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={onOpenCmsModal}
            className="px-5 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-purple-400 transition-all hover:scale-105"
          >
            <Edit3 className="w-4 h-4" />
            Apri CMS Console Pavone
          </button>
        </div>
      )}

      {/* 1. Hero Section - Athletic Split View */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Col (Text & CTAs) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/40 text-xs font-semibold text-purple-300">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Programmazione Scientifica di Bodybuilding Natural</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
                {landingContent.hero_title}
              </h1>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
                {landingContent.hero_subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsOnboardingModalOpen(true)}
                  className="px-7 py-4 rounded-xl text-white font-extrabold text-sm shadow-xl hover:shadow-purple-900/40 transition-all flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: theme.accent_primary }}
                >
                  <Sparkles className="w-4 h-4" />
                  Inizia Questionario (Entry €19 / VIP)
                </button>

                <button
                  onClick={() => setCurrentRoute('/app/dashboard')}
                  className="px-6 py-4 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {landingContent.hero_cta_text}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Verified Metrics Row */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6">
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-white font-mono-tabular">
                    -0.8%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Target Perdita/Settimana</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-white font-mono-tabular">
                    7 Aree
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Check-In & DOMS</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-white font-mono-tabular">
                    16 Ricette
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Porzioni a Mano & Sazietà</span>
                </div>
              </div>
            </div>

            {/* Right Col: High-Definition Photography Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                <img
                  src={landingContent.hero_image_url || '/assets/images/teampavone/hero_trasformazioni.png'}
                  alt="Team Pavone Trasformazioni e Risultati"
                  className="w-full h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-purple-400 block tracking-wider">
                      Overload Progressivo Controllato
                    </span>
                    <span className="text-xs font-bold text-white">
                      Tensione Meccanica & RIR 1-2
                    </span>
                  </div>
                  <Dumbbell className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. I 4 Pilastri del Metodo (Bento Grid Architecture) */}
      <section id="metodo" className="py-24 bg-slate-900/60 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 mb-2 block">
              Ingegneria della Composizione Corporea
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              I 4 Pilastri Operativi di Francesco Pavone
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Il coaching non è un foglio statico di esercizi: è un ciclo continuo di misurazione dei carichi, percezione dello sforzo, nutrizione a porzioni e abitudini quotidiane.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 hover:border-purple-600/50 transition-all shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-5">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Macrociclo & Fasi 12+ Settimane
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Periodizzazione a blocchi tra Tensione Meccanica, Ipertrofia Sarcoplasmatica, AMPK e Deload. Ciclizzazione glucidica millimetrica tra giorni ON e OFF.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] font-mono-tabular text-purple-400 font-semibold">
                Algoritmo Benchmark % Attivo
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 hover:border-purple-600/50 transition-all shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-5">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Workout Logger & Analytics DOMS
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tracking mobile di serie, kg, RIR, durata sessione e profilo di resistenza (Lengthened / Mid / Shortened), con pop-up DOMS mattutino e celebri PR automatici.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] font-mono-tabular text-indigo-400 font-semibold">
                Tonnellaggio & e1RM in Tempo Reale
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 hover:border-purple-600/50 transition-all shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Check-In Guidato in 7 Aree
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Media peso mobile a 7gg, foto progresso con EXIF/GPS rimossi, parametri su sonno, digestione, fame e video feedback d'esecuzione per correggere ogni alzata.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] font-mono-tabular text-emerald-400 font-semibold">
                Sondaggio Mobile-First
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 hover:border-purple-600/50 transition-all shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  GDPR Art. 9 & Sicurezza
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Consenso esplicito sui dati sanitari, cancellazione totale 1-Click (Diritto all'Oblio), export dati in JSON/CSV e storage crittografato privato con Signed URLs temporanei.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] font-mono-tabular text-rose-400 font-semibold">
                Conforme GDPR al 100%
              </div>
            </div>
          </div>

          {/* Coach Bio Focus Card with Portrait */}
          <div className="mt-16 grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
              <img
                src={landingContent.coach_portrait_url || '/assets/images/teampavone/francesco_pavone_wnbf.jpg'}
                alt="Francesco Pavone Head Coach"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-purple-600 shadow-md shrink-0"
              />
              <div className="space-y-3 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Head Coach & Fondatore
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-medium">Metodologia Pavone</span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  Francesco Pavone
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {landingContent.coach_bio}
                </p>
              </div>
            </div>

            <div className="md:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/images/teampavone/daniele_coach.jpg"
                  alt="Daniele Coach Team Pavone"
                  className="w-16 h-16 rounded-xl object-cover border border-purple-500/60 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                    Staff Tecnico
                  </span>
                  <h4 className="text-base font-bold text-white">Daniele</h4>
                  <span className="text-xs text-slate-400">Coach Collaboratore Team Pavone</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-4">
                Affianca Francesco nella supervisione dei check-in settimanali, nell'analisi dei video esecutivi e nella gestione dei parametri atletici per il roster agonisti e amatori.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bacheca Annunci & Circolari */}
      <section id="annunci" className="py-24 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 mb-2 block">
                Aggiornamenti per gli Atleti
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                Bacheca Comunicazioni & Articoli
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {landingContent.announcements.map((ann) => (
              <article
                key={ann.id}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-mono-tabular text-purple-400 mb-2">
                    {ann.date}
                  </div>
                  <h3 className="text-base font-bold text-white mb-3 leading-snug">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ann.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Storie di Trasformazione con Fotografie */}
      <section id="trasformazioni" className="py-24 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 mb-2 block">
              Evidenza Scientifica dei Risultati
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Cambiamenti Fisici Tracciati e Certificati
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Fotografie con stripping EXIF, dati di peso registrati a media mobile 7gg e aderenza nutrizionale documentata.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {landingContent.testimonials.map((test) => (
              <div
                key={test.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-xl"
              >
                {/* Before/After Asset */}
                <div className="h-56 bg-slate-900 relative overflow-hidden">
                  <img
                    src={test.before_after_url || '/assets/images/teampavone/trasformazione_1.png'}
                    alt={test.athlete_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-xs text-[10px] font-extrabold text-purple-300">
                    {test.change_metric}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 italic leading-relaxed mb-6">
                    "{test.text}"
                  </p>
                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{test.athlete_name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Atleta Team Pavone</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Candidatura Coaching Form */}
      <section id="contatti" className="py-24 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 mb-2 block">
              Selezione Roster Atleti
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Candidatura Coaching con Francesco Pavone
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Compila il modulo per inviare i tuoi parametri a Francesco e valutare la disponibilità di inserimento nel team.
            </p>
          </div>

          {submitted ? (
            <div className="bg-purple-950/40 border border-purple-700/80 p-8 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-purple-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Candidatura Inviata</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Grazie {contactName}! La tua richiesta è stata registrata nei log di sistema. Francesco o uno dei collaboratori del team analizzerà il tuo storico sportivo entro 48 ore.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800"
              >
                Invia un'altra richiesta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-900/80 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nome e Cognome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mario Rossi"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="mario.rossi@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Obiettivo, Anzianità di Allenamento e Massimali
                </label>
                <textarea
                  rows={4}
                  placeholder="Es. Mi alleno da 3 anni, cerco supporto per preparazione gara Men's Physique..."
                  value={contactGoal}
                  onChange={(e) => setContactGoal(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
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
      <footer className="py-8 bg-slate-950 border-t border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} {theme.brand_name} · Francesco Pavone Coaching Ecosystem.
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            <button onClick={() => setIsCookieModalOpen(true)} className="hover:text-slate-300 transition-colors">
              Preferenze Cookie
            </button>
            <button onClick={() => setCurrentRoute('/app/privacy-gdpr')} className="hover:text-slate-300 transition-colors">
              Privacy Policy & GDPR
            </button>
            <button onClick={() => setCurrentRoute('/login')} className="hover:text-slate-300 transition-colors">
              Accedi
            </button>
            <button onClick={() => setCurrentRoute('/app/dashboard')} className="hover:text-purple-300 text-purple-400 font-semibold transition-colors">
              Area Clienti
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
