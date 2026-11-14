/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LandingPillarAccent,
  LandingPillarIconName,
} from '../../types';
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
  Clock,
  Flame,
  Target,
  HeartPulse,
  Award,
  Calendar,
  Utensils,
} from 'lucide-react';

interface LandingPageProps {
  onOpenCmsModal?: () => void;
}

const PILLAR_ACCENT_CLASSES: Record<
  LandingPillarAccent,
  { iconBox: string; footerText: string }
> = {
  purple: {
    iconBox: 'bg-purple-950/60 border-purple-800/60 text-purple-400',
    footerText: 'text-purple-400',
  },
  indigo: {
    iconBox: 'bg-indigo-950/60 border-indigo-800/60 text-indigo-400',
    footerText: 'text-indigo-400',
  },
  emerald: {
    iconBox: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400',
    footerText: 'text-emerald-400',
  },
  rose: {
    iconBox: 'bg-rose-950/60 border-rose-800/60 text-rose-400',
    footerText: 'text-rose-400',
  },
  amber: {
    iconBox: 'bg-amber-950/60 border-amber-800/60 text-amber-400',
    footerText: 'text-amber-400',
  },
  slate: {
    iconBox: 'bg-slate-800 border-slate-700 text-slate-300',
    footerText: 'text-slate-300',
  },
};

function renderPillarIcon(iconName: LandingPillarIconName) {
  const cls = 'w-6 h-6';
  switch (iconName) {
    case 'FileSpreadsheet':
      return <FileSpreadsheet className={cls} />;
    case 'Dumbbell':
      return <Dumbbell className={cls} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={cls} />;
    case 'ShieldCheck':
      return <ShieldCheck className={cls} />;
    case 'Clock':
      return <Clock className={cls} />;
    case 'Flame':
      return <Flame className={cls} />;
    case 'Target':
      return <Target className={cls} />;
    case 'HeartPulse':
      return <HeartPulse className={cls} />;
    case 'Sparkles':
      return <Sparkles className={cls} />;
    case 'Award':
      return <Award className={cls} />;
    case 'Calendar':
      return <Calendar className={cls} />;
    case 'Utensils':
      return <Utensils className={cls} />;
    default:
      return <Dumbbell className={cls} />;
  }
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
  const methodCards = landingContent.method_cards || [];
  const publishedAnnouncements = (landingContent.announcements || []).filter((a) => a.published !== false);

  const methodGridColsClass =
    methodCards.length === 1
      ? 'grid-cols-1 max-w-xl mx-auto'
      : methodCards.length === 2
      ? 'md:grid-cols-2'
      : methodCards.length === 3
      ? 'md:grid-cols-3'
      : 'md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* If Coach: Floating CMS Quick Action */}
      {isCoach && onOpenCmsModal && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
          <button
            onClick={onOpenCmsModal}
            className="min-h-[44px] px-5 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-purple-400 transition-all hover:scale-105 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Apri CMS Console Pavone</span>
          </button>
        </div>
      )}

      {/* 1. Hero Section - Fully Controlled via CMS */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Col (Text & CTAs) */}
            <div className="lg:col-span-7 space-y-6 min-w-0">
              {landingContent.hero_badge && (
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{landingContent.hero_badge}</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] text-balance">
                {landingContent.hero_title}
              </h1>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
                {landingContent.hero_subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <button
                  onClick={() => setIsOnboardingModalOpen(true)}
                  className="min-h-[48px] px-6 sm:px-7 py-3.5 rounded-xl text-white font-extrabold text-sm shadow-xl hover:shadow-purple-900/40 transition-all flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: theme.accent_primary }}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{landingContent.hero_primary_cta_text}</span>
                </button>

                <button
                  onClick={() => setCurrentRoute('/app/dashboard')}
                  className="min-h-[48px] px-6 py-3.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>{landingContent.hero_cta_text}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>

              {/* Verified Metrics Row */}
              {(landingContent.hero_metrics || []).length > 0 && (
                <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 sm:gap-6">
                  {landingContent.hero_metrics.map((metric) => (
                    <div key={metric.id} className="min-w-0">
                      <span className="block text-xl sm:text-3xl font-black text-white font-mono-tabular">
                        {metric.value}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 font-medium block">
                        {metric.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: High-Definition Photography Frame */}
            <div className="lg:col-span-5 relative min-w-0">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                <img
                  src={landingContent.hero_image_url || '/assets/images/teampavone/hero_trasformazioni.png'}
                  alt={landingContent.hero_title}
                  referrerPolicy="no-referrer"
                  className="w-full h-[360px] sm:h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                {(landingContent.hero_image_caption_kicker || landingContent.hero_image_caption_title) && (
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase text-purple-400 block tracking-wider">
                        {landingContent.hero_image_caption_kicker}
                      </span>
                      <span className="text-xs font-bold text-white block truncate">
                        {landingContent.hero_image_caption_title}
                      </span>
                    </div>
                    <Dumbbell className="w-5 h-5 text-purple-400 shrink-0" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sezione Metodo & Pilastri Operativi (Fully CMS-Controlled, Icon or Image Above Text) */}
      {landingContent.method_visible !== false && (
        <section id="metodo" className="py-20 sm:py-24 bg-slate-900/60 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
              {landingContent.method_kicker && (
                <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 mb-2 block">
                  {landingContent.method_kicker}
                </span>
              )}
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
                {landingContent.method_title}
              </h2>
              {landingContent.method_subtitle && (
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                  {landingContent.method_subtitle}
                </p>
              )}
            </div>

            <div className={`grid gap-6 ${methodGridColsClass}`}>
              {methodCards.map((card) => {
                const accent = PILLAR_ACCENT_CLASSES[card.accent_color] || PILLAR_ACCENT_CLASSES.purple;
                const showImage = card.media_type === 'IMAGE' && Boolean(card.image_url);

                return (
                  <div
                    key={card.id}
                    className="bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-purple-600/50 transition-all shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {showImage ? (
                        <div className="h-44 w-full bg-slate-900 relative overflow-hidden border-b border-slate-800/80">
                          <img
                            src={card.image_url}
                            alt={card.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                        </div>
                      ) : null}

                      <div className="p-6">
                        {!showImage && (
                          <div
                            className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${accent.iconBox}`}
                          >
                            {renderPillarIcon(card.icon_name)}
                          </div>
                        )}
                        <h3 className="text-base font-bold text-white mb-2 leading-snug">
                          {card.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {card.footer_note && (
                      <div className="px-6 pb-6">
                        <div
                          className={`pt-4 border-t border-slate-900 text-[11px] font-mono-tabular font-semibold ${accent.footerText}`}
                        >
                          {card.footer_note}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Coach Bio & Staff Focus Row (CMS-Controlled) */}
            <div className="mt-16 grid md:grid-cols-12 gap-6">
              <div
                className={`${
                  landingContent.staff_visible !== false ? 'md:col-span-8' : 'md:col-span-12'
                } bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl`}
              >
                <img
                  src={landingContent.coach_portrait_url || '/assets/images/teampavone/francesco_pavone_wnbf.jpg'}
                  alt={landingContent.coach_name || 'Francesco Pavone'}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-purple-600 shadow-md shrink-0"
                />
                <div className="space-y-3 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                      {landingContent.coach_role_label}
                    </span>
                    {landingContent.coach_method_tag && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-slate-400 font-medium">
                          {landingContent.coach_method_tag}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    {landingContent.coach_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {landingContent.coach_bio}
                  </p>
                </div>
              </div>

              {landingContent.staff_visible !== false && (
                <div className="md:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
                  <div className="flex items-center gap-4">
                    <img
                      src={landingContent.staff_portrait_url || '/assets/images/teampavone/daniele_coach.jpg'}
                      alt={landingContent.staff_name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-purple-500/60 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                        {landingContent.staff_role_label}
                      </span>
                      <h4 className="text-base font-bold text-white truncate">
                        {landingContent.staff_name}
                      </h4>
                      <span className="text-xs text-slate-400 block">
                        {landingContent.staff_subtitle}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-4">
                    {landingContent.staff_bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. Bacheca Annunci & Circolari */}
      {landingContent.announcements_visible !== false && (
        <section id="annunci" className="py-20 sm:py-24 bg-slate-950 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                {landingContent.announcements_kicker && (
                  <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 mb-2 block">
                    {landingContent.announcements_kicker}
                  </span>
                )}
                <h2 className="text-3xl font-extrabold text-white">
                  {landingContent.announcements_title}
                </h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {publishedAnnouncements.map((ann) => (
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
      )}

      {/* 4. Storie di Trasformazione con Fotografie */}
      {landingContent.testimonials_visible !== false && (
        <section id="trasformazioni" className="py-20 sm:py-24 bg-slate-900/40 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
              {landingContent.testimonials_kicker && (
                <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 mb-2 block">
                  {landingContent.testimonials_kicker}
                </span>
              )}
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
                {landingContent.testimonials_title}
              </h2>
              {landingContent.testimonials_subtitle && (
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                  {landingContent.testimonials_subtitle}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {(landingContent.testimonials || []).map((test) => (
                <div
                  key={test.id}
                  className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  {/* Before/After Asset */}
                  <div className="h-56 bg-slate-900 relative overflow-hidden">
                    <img
                      src={test.before_after_url || '/assets/images/teampavone/trasformazione_1.png'}
                      alt={test.athlete_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                    {test.change_metric && (
                      <div className="absolute bottom-3 left-3 right-3 text-[11px] font-extrabold text-purple-200">
                        {test.change_metric}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 italic leading-relaxed mb-6">
                      "{test.text}"
                    </p>
                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{test.athlete_name}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {landingContent.testimonials_badge_label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Candidatura Coaching Form */}
      {landingContent.contact_visible !== false && (
        <section id="contatti" className="py-20 sm:py-24 bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              {landingContent.contact_kicker && (
                <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 mb-2 block">
                  {landingContent.contact_kicker}
                </span>
              )}
              <h2 className="text-3xl font-extrabold text-white">
                {landingContent.contact_title}
              </h2>
              {landingContent.contact_subtitle && (
                <p className="text-sm text-slate-400 mt-2">
                  {landingContent.contact_subtitle}
                </p>
              )}
            </div>

            {submitted ? (
              <div className="bg-purple-950/40 border border-purple-700/80 p-8 rounded-2xl text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-purple-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">{landingContent.contact_success_title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  Grazie {contactName}! {landingContent.contact_success_body}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  {landingContent.contact_reset_button_text}
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
                      className="w-full min-h-[44px] px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                      className="w-full min-h-[44px] px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="w-full min-h-[48px] py-3.5 rounded-xl text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: theme.accent_primary }}
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span>{landingContent.contact_submit_text}</span>
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Footer (CMS-Controlled) */}
      <footer className="py-8 bg-slate-950 border-t border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} {theme.brand_name} · {landingContent.footer_copyright_note}
          </div>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <button onClick={() => setIsCookieModalOpen(true)} className="hover:text-slate-300 transition-colors cursor-pointer">
              {landingContent.footer_cookie_label}
            </button>
            <button onClick={() => setCurrentRoute('/app/privacy-gdpr')} className="hover:text-slate-300 transition-colors cursor-pointer">
              {landingContent.footer_privacy_label}
            </button>
            <button onClick={() => setCurrentRoute('/login')} className="hover:text-slate-300 transition-colors cursor-pointer">
              {landingContent.footer_login_label}
            </button>
            <button onClick={() => setCurrentRoute('/app/dashboard')} className="hover:text-purple-300 text-purple-400 font-semibold transition-colors cursor-pointer">
              {landingContent.footer_portal_label}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
