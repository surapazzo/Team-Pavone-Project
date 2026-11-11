/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Edit3,
  X,
  Check,
  Plus,
  Trash2,
  Image,
  Upload,
  Sparkles,
  Layout,
  MessageSquare,
  Award,
} from 'lucide-react';
import heroBannerImg from '../../assets/images/hero_bodybuilding_aesthetic_1794409018984.jpg';
import coachPortraitImg from '../../assets/images/coach_francesco_portrait_1794409019780.jpg';
import athleteSquatImg from '../../assets/images/athlete_training_squat_1794409022012.jpg';

interface CoachCmsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoachCmsDrawer: React.FC<CoachCmsDrawerProps> = ({ isOpen, onClose }) => {
  const { landingContent, updateLandingContent, theme } = useApp();

  const [activeTab, setActiveTab] = useState<'HERO' | 'BIO' | 'ANNOUNCEMENTS' | 'TESTIMONIALS'>('HERO');

  // Form states
  const [heroTitle, setHeroTitle] = useState(landingContent.hero_title);
  const [heroSubtitle, setHeroSubtitle] = useState(landingContent.hero_subtitle);
  const [heroCtaText, setHeroCtaText] = useState(landingContent.hero_cta_text);
  const [heroImageUrl, setHeroImageUrl] = useState(landingContent.hero_image_url || '/assets/images/teampavone/hero_trasformazioni.png');
  const [coachPortraitUrl, setCoachPortraitUrl] = useState(landingContent.coach_portrait_url || '/assets/images/teampavone/francesco_pavone_wnbf.jpg');
  const [coachBio, setCoachBio] = useState(landingContent.coach_bio);
  const [announcements, setAnnouncements] = useState(landingContent.announcements);
  const [testimonials, setTestimonials] = useState(landingContent.testimonials);

  // New item states
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnBody, setNewAnnBody] = useState('');

  const [newTestName, setNewTestName] = useState('');
  const [newTestMetric, setNewTestMetric] = useState('');
  const [newTestText, setNewTestText] = useState('');
  const [newTestImg, setNewTestImg] = useState('/assets/images/teampavone/trasformazione_1.png');

  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = () => {
    updateLandingContent({
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_cta_text: heroCtaText,
      hero_image_url: heroImageUrl,
      coach_portrait_url: coachPortraitUrl,
      coach_bio: coachBio,
      announcements,
      testimonials,
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1500);
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnBody) return;
    const item = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle,
      body: newAnnBody,
      date: new Date().toISOString().split('T')[0],
      published: true,
    };
    setAnnouncements([item, ...announcements]);
    setNewAnnTitle('');
    setNewAnnBody('');
  };

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName || !newTestText) return;
    const item = {
      id: `test-${Date.now()}`,
      athlete_name: newTestName,
      change_metric: newTestMetric || '-6.5 kg in Deficit Controllato',
      text: newTestText,
      before_after_url: newTestImg || '/assets/images/teampavone/trasformazione_1.png',
    };
    setTestimonials([item, ...testimonials]);
    setNewTestName('');
    setNewTestMetric('');
    setNewTestText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center text-white">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                CMS Console Coach Pavone
              </h2>
              <p className="text-xs text-purple-300">
                Gestione completa in-place di testi, annunci, storie e immagini del sito pubblico
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs bg-slate-50">
          <button
            onClick={() => setActiveTab('HERO')}
            className={`px-4 py-2 font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'HERO'
                ? 'border-purple-700 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            Hero Section
          </button>
          <button
            onClick={() => setActiveTab('BIO')}
            className={`px-4 py-2 font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'BIO'
                ? 'border-purple-700 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Bio & Metodo
          </button>
          <button
            onClick={() => setActiveTab('ANNOUNCEMENTS')}
            className={`px-4 py-2 font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ANNOUNCEMENTS'
                ? 'border-purple-700 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Bacheca Annunci ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('TESTIMONIALS')}
            className={`px-4 py-2 font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'TESTIMONIALS'
                ? 'border-purple-700 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Trasformazioni ({testimonials.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {savedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Modifiche pubblicate con successo sul sito pubblico!</span>
            </div>
          )}

          {/* TAB 1: HERO */}
          {activeTab === 'HERO' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Titolo Principale (Hero Headline)
                </label>
                <textarea
                  rows={2}
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Sottotitolo Descrittivo
                </label>
                <textarea
                  rows={3}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Testo Bottone Principale (CTA)
                </label>
                <input
                  type="text"
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Image Asset Selector in Hero */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Immagine Banner Hero Ufficiale (teampavone.com)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Trasformazioni Team', url: '/assets/images/teampavone/hero_trasformazioni.png' },
                    { label: 'Francesco Palco Bellaria', url: '/assets/images/teampavone/francesco_stage.jpg' },
                    { label: 'Francesco Gara WNBF', url: '/assets/images/teampavone/francesco_pavone_wnbf.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setHeroImageUrl(preset.url)}
                      className={`p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all ${
                        heroImageUrl === preset.url
                          ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600'
                          : 'border-slate-200 hover:border-purple-300 bg-white'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover rounded-lg" />
                      <span className="text-[10px] font-bold text-slate-800 text-center leading-tight">{preset.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="URL personalizzato immagine..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BIO & METODO */}
          {activeTab === 'BIO' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Biografia e Filosofia di Coaching di Francesco Pavone
                </label>
                <textarea
                  rows={6}
                  value={coachBio}
                  onChange={(e) => setCoachBio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Ritratto Ufficiale Coach (teampavone.com)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Francesco WNBF Stage', url: '/assets/images/teampavone/francesco_pavone_wnbf.jpg' },
                    { label: 'Francesco Palco HD', url: '/assets/images/teampavone/francesco_stage.jpg' },
                    { label: 'Daniele Coach Staff', url: '/assets/images/teampavone/daniele_coach.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setCoachPortraitUrl(preset.url)}
                      className={`p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all ${
                        coachPortraitUrl === preset.url
                          ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600'
                          : 'border-slate-200 hover:border-purple-300 bg-white'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-16 h-16 object-cover rounded-full" />
                      <span className="text-[10px] font-bold text-slate-800 text-center leading-tight">{preset.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coachPortraitUrl}
                    onChange={(e) => setCoachPortraitUrl(e.target.value)}
                    placeholder="URL personalizzato ritratto..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANNOUNCEMENTS */}
          {activeTab === 'ANNOUNCEMENTS' && (
            <div className="space-y-6">
              {/* Form to add new announcement */}
              <form onSubmit={handleAddAnnouncement} className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
                <span className="font-bold text-purple-950 block">Aggiungi Nuovo Annuncio / Articolo</span>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Titolo dell'annuncio..."
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Corpo della comunicazione per gli atleti..."
                    value={newAnnBody}
                    onChange={(e) => setNewAnnBody(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Inserisci in Bacheca
                </button>
              </form>

              {/* List of active announcements */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 block">Annunci Attualmente Pubblicati</span>
                {announcements.map((ann, idx) => (
                  <div key={ann.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{ann.title}</span>
                      <button
                        onClick={() => setAnnouncements(announcements.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Rimuovi annuncio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-600 text-xs">{ann.body}</p>
                    <div className="text-[10px] text-slate-400 font-mono-tabular">Pubblicato: {ann.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TESTIMONIALS */}
          {activeTab === 'TESTIMONIALS' && (
            <div className="space-y-6">
              {/* Form to add testimonial */}
              <form onSubmit={handleAddTestimonial} className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
                <span className="font-bold text-purple-950 block">Aggiungi Nuova Storia di Trasformazione</span>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Nome Atleta (es. Luca Puci)"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Metrica (es. -7.2 kg in 16 Settimane)"
                    value={newTestMetric}
                    onChange={(e) => setNewTestMetric(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Citazione e riscontro dell'atleta..."
                    value={newTestText}
                    onChange={(e) => setNewTestText(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Seleziona Foto Trasformazione Ufficiale (teampavone.com)
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      { label: 'Trasformazione 1', url: '/assets/images/teampavone/trasformazione_1.png' },
                      { label: 'Trasformazione 2', url: '/assets/images/teampavone/trasformazione_2.png' },
                      { label: 'Trasformazione 3', url: '/assets/images/teampavone/trasformazione_3.png' },
                      { label: 'Trasformazione 4', url: '/assets/images/teampavone/trasformazione_4.png' },
                      { label: 'Trasformazione 5', url: '/assets/images/teampavone/trasformazione_5.png' },
                      { label: 'Trasformazione 6', url: '/assets/images/teampavone/trasformazione_6.jpg' },
                    ].map((tr) => (
                      <button
                        key={tr.url}
                        type="button"
                        onClick={() => setNewTestImg(tr.url)}
                        className={`p-1 rounded-lg border transition-all ${
                          newTestImg === tr.url
                            ? 'border-purple-600 bg-purple-100 ring-2 ring-purple-600'
                            : 'border-slate-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <img src={tr.url} alt={tr.label} className="w-full h-12 object-cover rounded" />
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Aggiungi Testimonianza
                </button>
              </form>

              {/* List */}
              <div className="space-y-3">
                {testimonials.map((t, idx) => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{t.athlete_name}</span>
                      <button
                        onClick={() => setTestimonials(testimonials.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-purple-700 font-semibold text-[11px]">{t.change_metric}</div>
                    <p className="text-slate-600 italic text-xs">"{t.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Chiudi
          </button>

          <button
            onClick={handleSaveAll}
            className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-sm flex items-center gap-2 hover:opacity-95 transition-all"
            style={{ backgroundColor: theme.accent_primary }}
          >
            <Check className="w-4 h-4" />
            Salva & Pubblica Modifiche
          </button>
        </div>
      </div>
    </div>
  );
};
