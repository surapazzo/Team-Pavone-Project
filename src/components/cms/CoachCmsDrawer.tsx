/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_LANDING_CONTENT } from '../../data/initialData';
import {
  LandingContent,
  LandingPillarAccent,
  LandingPillarCard,
  LandingPillarIconName,
} from '../../types';
import { stripExifFromImage } from '../../services/securityAndGdpr';
import {
  Edit3,
  X,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Layout,
  MessageSquare,
  Award,
  Navigation,
  Layers,
  Mail,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Clock,
  Dumbbell,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Target,
  HeartPulse,
  Calendar,
  Utensils,
} from 'lucide-react';

interface CoachCmsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type CmsTabKey =
  | 'NAVBAR'
  | 'HERO'
  | 'METHOD'
  | 'TEAM'
  | 'ANNOUNCEMENTS'
  | 'TESTIMONIALS'
  | 'CONTACT_FOOTER';

const PILLAR_ICONS: Array<{ id: LandingPillarIconName; label: string }> = [
  { id: 'FileSpreadsheet', label: 'Schede / Dati' },
  { id: 'Dumbbell', label: 'Allenamento' },
  { id: 'Clock', label: 'Orologio / Tempo' },
  { id: 'CheckCircle2', label: 'Check-In' },
  { id: 'ShieldCheck', label: 'Sicurezza / GDPR' },
  { id: 'Flame', label: 'Intensità / Metabolismo' },
  { id: 'Target', label: 'Obiettivi' },
  { id: 'HeartPulse', label: 'Recupero / Battito' },
  { id: 'Sparkles', label: 'Risultati' },
  { id: 'Award', label: 'Agonismo / Trofei' },
  { id: 'Calendar', label: 'Macrociclo' },
  { id: 'Utensils', label: 'Nutrizione' },
];

const PILLAR_ACCENTS: Array<{ id: LandingPillarAccent; label: string }> = [
  { id: 'purple', label: 'Viola Pavone' },
  { id: 'indigo', label: 'Indaco' },
  { id: 'emerald', label: 'Smeraldo' },
  { id: 'rose', label: 'Rosso / Rosa' },
  { id: 'amber', label: 'Ambra' },
  { id: 'slate', label: 'Grigio Grafite' },
];

const TEAM_PAVONE_GALLERY = [
  { label: 'Trasformazioni Hero', url: '/assets/images/teampavone/hero_trasformazioni.png' },
  { label: 'Francesco Palco', url: '/assets/images/teampavone/francesco_stage.jpg' },
  { label: 'Francesco WNBF', url: '/assets/images/teampavone/francesco_pavone_wnbf.jpg' },
  { label: 'Daniele Coach', url: '/assets/images/teampavone/daniele_coach.jpg' },
  { label: 'Trasformazione 1', url: '/assets/images/teampavone/trasformazione_1.png' },
  { label: 'Trasformazione 2', url: '/assets/images/teampavone/trasformazione_2.png' },
  { label: 'Trasformazione 3', url: '/assets/images/teampavone/trasformazione_3.png' },
  { label: 'Trasformazione 4', url: '/assets/images/teampavone/trasformazione_4.png' },
  { label: 'Trasformazione 5', url: '/assets/images/teampavone/trasformazione_5.png' },
  { label: 'Trasformazione 6', url: '/assets/images/teampavone/trasformazione_6.jpg' },
];

function renderSmallIcon(iconName: LandingPillarIconName) {
  const cls = 'w-4 h-4';
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

export const CoachCmsDrawer: React.FC<CoachCmsDrawerProps> = ({ isOpen, onClose }) => {
  const { landingContent, updateLandingContent, theme, updateTheme } = useApp();

  const [activeTab, setActiveTab] = useState<CmsTabKey>('NAVBAR');
  const [draft, setDraft] = useState<LandingContent>(landingContent);
  const [brandNameDraft, setBrandNameDraft] = useState(theme.brand_name);
  const [brandLogoDraft, setBrandLogoDraft] = useState(theme.logo_url || '');

  // Quick add states for Announcements & Testimonials
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnBody, setNewAnnBody] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestMetric, setNewTestMetric] = useState('');
  const [newTestText, setNewTestText] = useState('');
  const [newTestImg, setNewTestImg] = useState('/assets/images/teampavone/trasformazione_1.png');

  const [savedNotice, setSavedNotice] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(landingContent);
      setBrandNameDraft(theme.brand_name);
      setBrandLogoDraft(theme.logo_url || '');
      setSavedNotice(false);
    }
  }, [isOpen, landingContent, theme]);

  if (!isOpen) return null;

  const updateField = <K extends keyof LandingContent>(key: K, value: LandingContent[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadImage = async (
    file: File | undefined,
    targetKey: string,
    onLoaded: (dataUrl: string) => void
  ) => {
    if (!file) return;
    setUploadingTarget(targetKey);
    try {
      const { cleanDataUrl } = await stripExifFromImage(file);
      onLoaded(cleanDataUrl);
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleSaveAll = () => {
    updateLandingContent(draft);
    updateTheme({
      brand_name: brandNameDraft.trim() || 'Team Pavone',
      logo_url: brandLogoDraft.trim() || undefined,
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1100);
  };

  const handleResetDefaults = () => {
    setDraft(INITIAL_LANDING_CONTENT);
    setBrandNameDraft('Team Pavone');
    setBrandLogoDraft('/assets/images/teampavone/logo_teampavone.png');
  };

  const handleMovePillar = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= draft.method_cards.length) return;
    const copy = [...draft.method_cards];
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item);
    updateField('method_cards', copy);
  };

  const handleAddPillar = () => {
    const newCard: LandingPillarCard = {
      id: `pillar-${Date.now()}`,
      title: 'Nuovo Pilastro Operativo',
      description: 'Descrizione personalizzata del protocollo o del servizio.',
      footer_note: 'Protocollo Team Pavone',
      media_type: 'IMAGE',
      icon_name: 'Clock',
      image_url: '/assets/images/teampavone/hero_trasformazioni.png',
      accent_color: 'purple',
    };
    updateField('method_cards', [...draft.method_cards, newCard]);
  };

  const handleUpdatePillar = (id: string, patch: Partial<LandingPillarCard>) => {
    updateField(
      'method_cards',
      draft.method_cards.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const handleAddNavLink = () => {
    updateField('nav_links', [
      ...draft.nav_links,
      { id: `nav-${Date.now()}`, label: 'Nuova Voce', href: '#metodo', visible: true },
    ]);
  };

  const handleAddHeroMetric = () => {
    updateField('hero_metrics', [
      ...draft.hero_metrics,
      { id: `hm-${Date.now()}`, value: '100%', label: 'Metrica Personalizzata' },
    ]);
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
    updateField('announcements', [item, ...draft.announcements]);
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
    updateField('testimonials', [item, ...draft.testimonials]);
    setNewTestName('');
    setNewTestMetric('');
    setNewTestText('');
  };

  const tabs: Array<{ id: CmsTabKey; label: string; icon: React.ReactNode }> = [
    { id: 'NAVBAR', label: 'Navbar & Bottoni', icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'HERO', label: 'Hero & CTA', icon: <Layout className="w-3.5 h-3.5" /> },
    { id: 'METHOD', label: `Metodo & Pilastri (${draft.method_cards.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'TEAM', label: 'Coach & Staff', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'ANNOUNCEMENTS', label: `Annunci (${draft.announcements.length})`, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'TESTIMONIALS', label: `Trasformazioni (${draft.testimonials.length})`, icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'CONTACT_FOOTER', label: 'Candidatura & Footer', icon: <Mail className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center text-white shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                CMS Completo · Sito Principale Team Pavone
              </h2>
              <p className="text-[11px] text-purple-300 truncate">
                Controllo totale per macrocomponenti: Navbar, Bottoni, Pilastri (Icona/Immagine), Bio, Annunci, Testimonianze e Footer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Chiudi CMS"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Macro-Structure Tab Bar */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs bg-slate-50 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[40px] px-3 py-2 font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-purple-700 text-purple-900 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800">
          {savedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Tutte le modifiche CMS sono state pubblicate sul sito principale!</span>
            </div>
          )}

          {/* TAB 1: NAVBAR & TOP BAR */}
          {activeTab === 'NAVBAR' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Brand & Logo Header</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nome Brand nella Navbar</label>
                    <input
                      type="text"
                      value={brandNameDraft}
                      onChange={(e) => setBrandNameDraft(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Logo (URL o Upload)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={brandLogoDraft}
                        onChange={(e) => setBrandLogoDraft(e.target.value)}
                        placeholder="/assets/images/teampavone/logo_teampavone.png"
                        className="flex-1 min-w-0 min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                      <label className="min-h-[42px] px-3 py-2 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingTarget === 'logo' ? '...' : 'Carica'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleUploadImage(e.target.files?.[0], 'logo', (url) => setBrandLogoDraft(url))
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navbar CTA Buttons */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Nomi Bottoni nella Navbar Superiore</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bottone Questionario Onboarding</label>
                    <input
                      type="text"
                      value={draft.nav_onboarding_label}
                      onChange={(e) => updateField('nav_onboarding_label', e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bottone Login / Accesso</label>
                    <input
                      type="text"
                      value={draft.nav_login_label}
                      onChange={(e) => updateField('nav_login_label', e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bottone Primario Area App</label>
                    <input
                      type="text"
                      value={draft.nav_app_label}
                      onChange={(e) => updateField('nav_app_label', e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bottone Ritorno al Sito Pubblico</label>
                    <input
                      type="text"
                      value={draft.nav_public_site_label}
                      onChange={(e) => updateField('nav_public_site_label', e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Navbar Menu Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Voci Menu di Navigazione (Landing)</h3>
                    <p className="text-[11px] text-slate-500">Modifica etichette, ancoraggi (#metodo, #annunci...) o nascondi voci.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNavLink}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-purple-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aggiungi Voce
                  </button>
                </div>

                <div className="space-y-2.5">
                  {draft.nav_links.map((link, idx) => (
                    <div key={link.id} className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center gap-2.5">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const next = [...draft.nav_links];
                          next[idx] = { ...link, label: e.target.value };
                          updateField('nav_links', next);
                        }}
                        placeholder="Nome link"
                        className="flex-1 min-h-[40px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => {
                          const next = [...draft.nav_links];
                          next[idx] = { ...link, href: e.target.value };
                          updateField('nav_links', next);
                        }}
                        placeholder="#sezione o URL"
                        className="sm:w-44 min-h-[40px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
                      />
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={link.visible !== false}
                            onChange={(e) => {
                              const next = [...draft.nav_links];
                              next[idx] = { ...link, visible: e.target.checked };
                              updateField('nav_links', next);
                            }}
                            className="accent-purple-700"
                          />
                          Visibile
                        </label>
                        <button
                          type="button"
                          onClick={() => updateField('nav_links', draft.nav_links.filter((_, i) => i !== idx))}
                          className="min-h-[38px] min-w-[38px] rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HERO SECTION */}
          {activeTab === 'HERO' && (
            <div className="space-y-5">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Occhiello / Badge Hero</label>
                <input
                  type="text"
                  value={draft.hero_badge}
                  onChange={(e) => updateField('hero_badge', e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Titolo Principale (Hero Headline)</label>
                <textarea
                  rows={2}
                  value={draft.hero_title}
                  onChange={(e) => updateField('hero_title', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Sottotitolo Descrittivo</label>
                <textarea
                  rows={3}
                  value={draft.hero_subtitle}
                  onChange={(e) => updateField('hero_subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-700"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-purple-50/60 border border-purple-200">
                <div>
                  <label className="block font-bold text-purple-950 mb-1">Nome Bottone Primario Hero (CTA 1)</label>
                  <input
                    type="text"
                    value={draft.hero_primary_cta_text}
                    onChange={(e) => updateField('hero_primary_cta_text', e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-purple-950 mb-1">Nome Bottone Secondario Hero (CTA 2)</label>
                  <input
                    type="text"
                    value={draft.hero_cta_text}
                    onChange={(e) => updateField('hero_cta_text', e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Hero Image + Caption */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block font-extrabold text-slate-900">Immagine Banner Hero & Didascalia</label>
                <div className="grid grid-cols-3 gap-2">
                  {TEAM_PAVONE_GALLERY.slice(0, 3).map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => updateField('hero_image_url', preset.url)}
                      className={`p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 cursor-pointer ${
                        draft.hero_image_url === preset.url
                          ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-14 object-cover rounded-lg" />
                      <span className="text-[10px] font-bold text-slate-800 text-center">{preset.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={draft.hero_image_url || ''}
                    onChange={(e) => updateField('hero_image_url', e.target.value)}
                    placeholder="URL immagine Hero..."
                    className="flex-1 min-w-0 min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                  <label className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingTarget === 'hero' ? 'Caricamento...' : 'Carica Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleUploadImage(e.target.files?.[0], 'hero', (url) => updateField('hero_image_url', url))
                      }
                    />
                  </label>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Didascalia Sopra Foto (Riga 1)</label>
                    <input
                      type="text"
                      value={draft.hero_image_caption_kicker}
                      onChange={(e) => updateField('hero_image_caption_kicker', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Didascalia Foto (Riga 2)</label>
                    <input
                      type="text"
                      value={draft.hero_image_caption_title}
                      onChange={(e) => updateField('hero_image_caption_title', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900">Metriche Evidenza sotto Hero</label>
                  <button
                    type="button"
                    onClick={handleAddHeroMetric}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aggiungi Metrica
                  </button>
                </div>
                <div className="space-y-2">
                  {draft.hero_metrics.map((m, idx) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={m.value}
                        onChange={(e) => {
                          const next = [...draft.hero_metrics];
                          next[idx] = { ...m, value: e.target.value };
                          updateField('hero_metrics', next);
                        }}
                        placeholder="Valore (es. -0.8%)"
                        className="w-32 min-h-[40px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-tabular font-bold"
                      />
                      <input
                        type="text"
                        value={m.label}
                        onChange={(e) => {
                          const next = [...draft.hero_metrics];
                          next[idx] = { ...m, label: e.target.value };
                          updateField('hero_metrics', next);
                        }}
                        placeholder="Descrizione metrica"
                        className="flex-1 min-w-0 min-h-[40px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => updateField('hero_metrics', draft.hero_metrics.filter((_, i) => i !== idx))}
                        className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-rose-50 text-rose-600 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: METHOD & OPERATIONAL PILLARS (ICON OR IMAGE ABOVE TEXT) */}
          {activeTab === 'METHOD' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Intestazione Sezione Metodo & Pilastri</h3>
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.method_visible !== false}
                      onChange={(e) => updateField('method_visible', e.target.checked)}
                      className="accent-purple-700"
                    />
                    Sezione Visibile
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Occhiello (Kicker)</label>
                    <input
                      type="text"
                      value={draft.method_kicker}
                      onChange={(e) => updateField('method_kicker', e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Titolo Sezione</label>
                    <input
                      type="text"
                      value={draft.method_title}
                      onChange={(e) => updateField('method_title', e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descrizione Sezione</label>
                  <textarea
                    rows={2}
                    value={draft.method_subtitle}
                    onChange={(e) => updateField('method_subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Card / Pilastri Operativi ({draft.method_cards.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Scegli per ogni card se mostrare un&apos;<strong>Icona</strong> oppure un&apos;<strong>Immagine sopra il testo</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPillar}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Aggiungi Card
                </button>
              </div>

              <div className="space-y-4">
                {draft.method_cards.map((card, idx) => (
                  <div key={card.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 font-extrabold text-slate-900">
                        <span className="text-purple-700 font-mono-tabular">0{idx + 1}.</span>
                        <span className="truncate">{card.title || 'Pilastro senza titolo'}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMovePillar(idx, -1)}
                          disabled={idx === 0}
                          className="min-h-[36px] min-w-[36px] rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                          title="Sposta su"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePillar(idx, 1)}
                          disabled={idx === draft.method_cards.length - 1}
                          className="min-h-[36px] min-w-[36px] rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                          title="Sposta giù"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(
                              'method_cards',
                              draft.method_cards.filter((c) => c.id !== card.id)
                            )
                          }
                          className="min-h-[36px] min-w-[36px] rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center cursor-pointer"
                          title="Elimina Card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Media Option Toggle: ICON vs IMAGE above text */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800">Visuale sopra il testo:</span>
                      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleUpdatePillar(card.id, { media_type: 'ICON' })}
                          className={`min-h-[36px] px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                            card.media_type === 'ICON'
                              ? 'bg-white text-purple-900 shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Opzione Icona
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdatePillar(card.id, { media_type: 'IMAGE' })}
                          className={`min-h-[36px] px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                            card.media_type === 'IMAGE'
                              ? 'bg-white text-purple-900 shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          Opzione Immagine
                        </button>
                      </div>
                    </div>

                    {card.media_type === 'ICON' ? (
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Icona</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {PILLAR_ICONS.map((ic) => (
                              <button
                                key={ic.id}
                                type="button"
                                onClick={() => handleUpdatePillar(card.id, { icon_name: ic.id })}
                                className={`min-h-[36px] px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer ${
                                  card.icon_name === ic.id
                                    ? 'border-purple-700 bg-purple-50 text-purple-900'
                                    : 'border-slate-200 bg-white text-slate-700'
                                }`}
                              >
                                {renderSmallIcon(ic.id)}
                                <span className="truncate">{ic.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Colore Accento Card</label>
                          <select
                            value={card.accent_color}
                            onChange={(e) =>
                              handleUpdatePillar(card.id, { accent_color: e.target.value as LandingPillarAccent })
                            }
                            className="w-full min-h-[42px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                          >
                            {PILLAR_ACCENTS.map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {acc.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5 p-3 rounded-xl bg-purple-50/40 border border-purple-200">
                        <div className="flex flex-wrap items-center gap-3">
                          {card.image_url && (
                            <img
                              src={card.image_url}
                              alt={card.title}
                              referrerPolicy="no-referrer"
                              className="w-20 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          )}
                          <input
                            type="text"
                            value={card.image_url || ''}
                            onChange={(e) => handleUpdatePillar(card.id, { image_url: e.target.value })}
                            placeholder="URL immagine sopra il testo..."
                            className="flex-1 min-w-0 min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl"
                          />
                          <label className="min-h-[42px] px-3 py-2 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingTarget === card.id ? '...' : 'Carica Foto'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleUploadImage(e.target.files?.[0], card.id, (url) =>
                                  handleUpdatePillar(card.id, { image_url: url })
                                )
                              }
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {TEAM_PAVONE_GALLERY.slice(0, 6).map((preset) => (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => handleUpdatePillar(card.id, { image_url: preset.url })}
                              className={`p-1 rounded-lg border shrink-0 cursor-pointer ${
                                card.image_url === preset.url
                                  ? 'border-purple-700 ring-2 ring-purple-600'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <img src={preset.url} alt={preset.label} className="w-12 h-9 object-cover rounded" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Titolo Card</label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => handleUpdatePillar(card.id, { title: e.target.value })}
                          className="w-full min-h-[40px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nota Finale (Footer Card)</label>
                        <input
                          type="text"
                          value={card.footer_note}
                          onChange={(e) => handleUpdatePillar(card.id, { footer_note: e.target.value })}
                          className="w-full min-h-[40px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-tabular"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Testo Descrittivo</label>
                      <textarea
                        rows={2}
                        value={card.description}
                        onChange={(e) => handleUpdatePillar(card.id, { description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COACH BIO & STAFF */}
          {activeTab === 'TEAM' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Card Head Coach</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nome Coach</label>
                    <input
                      type="text"
                      value={draft.coach_name}
                      onChange={(e) => updateField('coach_name', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ruolo</label>
                    <input
                      type="text"
                      value={draft.coach_role_label}
                      onChange={(e) => updateField('coach_role_label', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tag Metodo</label>
                    <input
                      type="text"
                      value={draft.coach_method_tag}
                      onChange={(e) => updateField('coach_method_tag', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biografia e Filosofia di Coaching</label>
                  <textarea
                    rows={4}
                    value={draft.coach_bio}
                    onChange={(e) => updateField('coach_bio', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-2">Ritratto Coach (Preset o Upload)</label>
                  <div className="grid grid-cols-3 gap-2 mb-2.5">
                    {TEAM_PAVONE_GALLERY.slice(1, 4).map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => updateField('coach_portrait_url', preset.url)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer ${
                          draft.coach_portrait_url === preset.url
                            ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-14 h-14 object-cover rounded-full" />
                        <span className="text-[10px] font-bold text-slate-800 text-center">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={draft.coach_portrait_url || ''}
                      onChange={(e) => updateField('coach_portrait_url', e.target.value)}
                      placeholder="URL ritratto Coach..."
                      className="flex-1 min-w-0 min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                    <label className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Carica Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadImage(e.target.files?.[0], 'coach', (url) =>
                            updateField('coach_portrait_url', url)
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Staff Collaborator Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Card Staff Collaboratore</h3>
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.staff_visible !== false}
                      onChange={(e) => updateField('staff_visible', e.target.checked)}
                      className="accent-purple-700"
                    />
                    Visibile
                  </label>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nome Staff</label>
                    <input
                      type="text"
                      value={draft.staff_name}
                      onChange={(e) => updateField('staff_name', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Etichetta Ruolo</label>
                    <input
                      type="text"
                      value={draft.staff_role_label}
                      onChange={(e) => updateField('staff_role_label', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Qualifica</label>
                    <input
                      type="text"
                      value={draft.staff_subtitle}
                      onChange={(e) => updateField('staff_subtitle', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descrizione Staff</label>
                  <textarea
                    rows={3}
                    value={draft.staff_bio}
                    onChange={(e) => updateField('staff_bio', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={draft.staff_portrait_url || ''}
                    onChange={(e) => updateField('staff_portrait_url', e.target.value)}
                    placeholder="URL ritratto staff..."
                    className="flex-1 min-w-0 min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                  />
                  <label className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carica Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleUploadImage(e.target.files?.[0], 'staff', (url) =>
                          updateField('staff_portrait_url', url)
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANNOUNCEMENTS */}
          {activeTab === 'ANNOUNCEMENTS' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Intestazione Bacheca Annunci</h3>
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.announcements_visible !== false}
                      onChange={(e) => updateField('announcements_visible', e.target.checked)}
                      className="accent-purple-700"
                    />
                    Sezione Visibile
                  </label>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Occhiello</label>
                    <input
                      type="text"
                      value={draft.announcements_kicker}
                      onChange={(e) => updateField('announcements_kicker', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Titolo Sezione</label>
                    <input
                      type="text"
                      value={draft.announcements_title}
                      onChange={(e) => updateField('announcements_title', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddAnnouncement} className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
                <span className="font-extrabold text-purple-950 block">Aggiungi Nuovo Annuncio / Articolo</span>
                <input
                  type="text"
                  required
                  placeholder="Titolo dell'annuncio..."
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Corpo della comunicazione per gli atleti..."
                  value={newAnnBody}
                  onChange={(e) => setNewAnnBody(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Inserisci in Bacheca
                </button>
              </form>

              <div className="space-y-3">
                <span className="font-extrabold text-slate-800 block">Annunci Pubblicati (Modifica Inline)</span>
                {draft.announcements.map((ann, idx) => (
                  <div key={ann.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ann.title}
                        onChange={(e) => {
                          const next = [...draft.announcements];
                          next[idx] = { ...ann, title: e.target.value };
                          updateField('announcements', next);
                        }}
                        className="flex-1 min-h-[38px] px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                      />
                      <input
                        type="date"
                        value={ann.date}
                        onChange={(e) => {
                          const next = [...draft.announcements];
                          next[idx] = { ...ann, date: e.target.value };
                          updateField('announcements', next);
                        }}
                        className="min-h-[38px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            'announcements',
                            draft.announcements.filter((_, i) => i !== idx)
                          )
                        }
                        className="min-h-[38px] min-w-[38px] text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                        title="Rimuovi annuncio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={ann.body}
                      onChange={(e) => {
                        const next = [...draft.announcements];
                        next[idx] = { ...ann, body: e.target.value };
                        updateField('announcements', next);
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TESTIMONIALS */}
          {activeTab === 'TESTIMONIALS' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Intestazione Sezione Trasformazioni</h3>
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.testimonials_visible !== false}
                      onChange={(e) => updateField('testimonials_visible', e.target.checked)}
                      className="accent-purple-700"
                    />
                    Sezione Visibile
                  </label>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Occhiello</label>
                    <input
                      type="text"
                      value={draft.testimonials_kicker}
                      onChange={(e) => updateField('testimonials_kicker', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Titolo Sezione</label>
                    <input
                      type="text"
                      value={draft.testimonials_title}
                      onChange={(e) => updateField('testimonials_title', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sottotitolo</label>
                    <input
                      type="text"
                      value={draft.testimonials_subtitle}
                      onChange={(e) => updateField('testimonials_subtitle', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Etichetta Card (es. Atleta Team Pavone)</label>
                    <input
                      type="text"
                      value={draft.testimonials_badge_label}
                      onChange={(e) => updateField('testimonials_badge_label', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddTestimonial} className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
                <span className="font-extrabold text-purple-950 block">Aggiungi Nuova Storia di Trasformazione</span>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Nome Atleta (es. Luca Puci)"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Metrica (es. -7.2 kg in 16 Settimane)"
                    value={newTestMetric}
                    onChange={(e) => setNewTestMetric(e.target.value)}
                    className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Citazione e riscontro dell'atleta..."
                  value={newTestText}
                  onChange={(e) => setNewTestText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-bold text-slate-800">Foto Trasformazione (Preset o Upload)</label>
                    <label className="min-h-[36px] px-3 py-1 rounded-xl bg-slate-900 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Carica Nuova Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadImage(e.target.files?.[0], 'new-test', (url) => setNewTestImg(url))
                        }
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {TEAM_PAVONE_GALLERY.slice(4, 10).map((tr) => (
                      <button
                        key={tr.url}
                        type="button"
                        onClick={() => setNewTestImg(tr.url)}
                        className={`p-1 rounded-lg border cursor-pointer ${
                          newTestImg === tr.url
                            ? 'border-purple-600 bg-purple-100 ring-2 ring-purple-600'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <img src={tr.url} alt={tr.label} className="w-full h-12 object-cover rounded" />
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Aggiungi Testimonianza
                </button>
              </form>

              <div className="space-y-3">
                {draft.testimonials.map((tItem, idx) => (
                  <div key={tItem.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={tItem.athlete_name}
                        onChange={(e) => {
                          const next = [...draft.testimonials];
                          next[idx] = { ...tItem, athlete_name: e.target.value };
                          updateField('testimonials', next);
                        }}
                        className="font-bold text-slate-900 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            'testimonials',
                            draft.testimonials.filter((_, i) => i !== idx)
                          )
                        }
                        className="min-h-[36px] min-w-[36px] text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={tItem.change_metric || ''}
                      onChange={(e) => {
                        const next = [...draft.testimonials];
                        next[idx] = { ...tItem, change_metric: e.target.value };
                        updateField('testimonials', next);
                      }}
                      placeholder="Risultato"
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-purple-700 font-semibold text-[11px]"
                    />
                    <textarea
                      rows={2}
                      value={tItem.text}
                      onChange={(e) => {
                        const next = [...draft.testimonials];
                        next[idx] = { ...tItem, text: e.target.value };
                        updateField('testimonials', next);
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 italic text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CONTACT FORM & FOOTER */}
          {activeTab === 'CONTACT_FOOTER' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Sezione Candidatura Coaching</h3>
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.contact_visible !== false}
                      onChange={(e) => updateField('contact_visible', e.target.checked)}
                      className="accent-purple-700"
                    />
                    Sezione Visibile
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Occhiello</label>
                    <input
                      type="text"
                      value={draft.contact_kicker}
                      onChange={(e) => updateField('contact_kicker', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Titolo Modulo</label>
                    <input
                      type="text"
                      value={draft.contact_title}
                      onChange={(e) => updateField('contact_title', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sottotitolo</label>
                  <textarea
                    rows={2}
                    value={draft.contact_subtitle}
                    onChange={(e) => updateField('contact_subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-purple-900 mb-1">Testo Bottone Invio Candidatura</label>
                    <input
                      type="text"
                      value={draft.contact_submit_text}
                      onChange={(e) => updateField('contact_submit_text', e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bottone Nuovo Invio</label>
                    <input
                      type="text"
                      value={draft.contact_reset_button_text}
                      onChange={(e) => updateField('contact_reset_button_text', e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Footer & Link / Bottoni Finali</h3>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Testo Copyright / Note Brand</label>
                  <input
                    type="text"
                    value={draft.footer_copyright_note}
                    onChange={(e) => updateField('footer_copyright_note', e.target.value)}
                    className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Etichetta Cookie</label>
                    <input
                      type="text"
                      value={draft.footer_cookie_label}
                      onChange={(e) => updateField('footer_cookie_label', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Etichetta Privacy / GDPR</label>
                    <input
                      type="text"
                      value={draft.footer_privacy_label}
                      onChange={(e) => updateField('footer_privacy_label', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Etichetta Accesso</label>
                    <input
                      type="text"
                      value={draft.footer_login_label}
                      onChange={(e) => updateField('footer_login_label', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Etichetta Area Clienti</label>
                    <input
                      type="text"
                      value={draft.footer_portal_label}
                      onChange={(e) => updateField('footer_portal_label', e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="min-h-[42px] px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ripristina Predefiniti
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Chiudi
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="min-h-[44px] px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer"
              style={{ backgroundColor: theme.accent_primary }}
            >
              <Check className="w-4 h-4" />
              Salva & Pubblica Modifiche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
