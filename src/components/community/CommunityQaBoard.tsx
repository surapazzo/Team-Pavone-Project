/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { QaTopic } from '../../types';
import {
  MessageSquare,
  Pin,
  Search,
  Send,
  ShieldCheck,
  Clock,
  User,
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

const TOPICS: QaTopic[] = ['Training', 'Nutrition', 'Habits', 'Recovery', 'Logistics'];

export const CommunityQaBoard: React.FC = () => {
  const {
    currentUser,
    qaThreads,
    createQaThread,
    replyToQaThread,
    togglePinQaThread,
    theme,
  } = useApp();
  const { t } = useTranslation();

  const isCoach = currentUser.role === 'COACH';

  const [selectedTopic, setSelectedTopic] = useState<QaTopic | 'ALL'>('ALL');
  const [onlyMyQuestions, setOnlyMyQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Thread Form
  const [newTopic, setNewTopic] = useState<QaTopic>('Training');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  // Reply Drafts per thread
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const filteredThreads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return [...qaThreads]
      .filter((th) => {
        if (selectedTopic !== 'ALL' && th.topic !== selectedTopic) return false;
        if (onlyMyQuestions && th.author_id !== currentUser.id) return false;
        if (q) {
          const hit =
            th.title.toLowerCase().includes(q) ||
            th.body.toLowerCase().includes(q) ||
            th.replies.some((r) => r.body.toLowerCase().includes(q));
          if (!hit) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return b.created_at.localeCompare(a.created_at);
      });
  }, [qaThreads, selectedTopic, onlyMyQuestions, searchQuery, currentUser.id]);

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    createQaThread(newTopic, newTitle, newBody);
    setNewTitle('');
    setNewBody('');
  };

  const handleSendReply = (threadId: string) => {
    const draft = replyDrafts[threadId];
    if (!draft || !draft.trim()) return;
    replyToQaThread(threadId, draft);
    setReplyDrafts((prev) => ({ ...prev, [threadId]: '' }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 lg:pb-10">
      {/* Header */}
      <div className="bg-slate-950 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {t('community.subtitle')}
          </div>
          <h1 className="text-2xl font-black mt-1">{t('community.title')}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Domande asincrone categorizzate, risposte ufficiali del Coach e FAQ ricercabili (input sanitizzato XSS/GDPR).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOnlyMyQuestions(!onlyMyQuestions)}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 cursor-pointer shrink-0 ${
            onlyMyQuestions
              ? 'bg-purple-700 text-white border-purple-500'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          {t('community.myQuestions')}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca nelle FAQ e nelle risposte passate del Coach (es. RIR, basmati, DOMS)..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedTopic('ALL')}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
              selectedTopic === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('community.allTopics')} ({qaThreads.length})
          </button>
          {TOPICS.map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setSelectedTopic(tp)}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                selectedTopic === tp
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Post New Question Box */}
      <form
        onSubmit={handleCreateThread}
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-700" />
            Nuova Domanda nella Bacheca
          </h2>
          <select
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value as QaTopic)}
            className="min-h-[38px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
          >
            {TOPICS.map((tp) => (
              <option key={tp} value={tp}>
                Topic: {tp}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          required
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Titolo sintetico della domanda..."
          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
        />
        <textarea
          rows={3}
          required
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder={t('community.askPlaceholder')}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Protezione attiva contro XSS & prompt injection.
          </span>
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2 rounded-xl text-white font-bold flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: theme.accent_primary }}
          >
            <Send className="w-3.5 h-3.5" /> Pubblica Domanda
          </button>
        </div>
      </form>

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.map((thread) => (
          <div
            key={thread.id}
            className={`bg-white p-5 rounded-2xl border shadow-xs space-y-4 ${
              thread.is_pinned ? 'border-purple-300 bg-purple-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                  {thread.is_pinned && (
                    <span className="text-purple-700 flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5" /> {t('community.pinned')}
                    </span>
                  )}
                  <span className="text-slate-500 uppercase tracking-wider">{thread.topic}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">{thread.author_name}</span>
                  <span className="text-slate-400 font-normal font-mono-tabular">
                    {thread.created_at.slice(0, 10)}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{thread.title}</h3>
              </div>

              {isCoach && (
                <button
                  type="button"
                  onClick={() => togglePinQaThread(thread.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Pin className="w-3 h-3" />
                  {thread.is_pinned ? 'Rimuovi Pin' : 'Fissa FAQ'}
                </button>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{thread.body}</p>

            {/* Replies */}
            {thread.replies.length > 0 && (
              <div className="space-y-2.5 pl-3 sm:pl-5 border-l border-slate-200">
                {thread.replies.map((rep) => (
                  <div
                    key={rep.id}
                    className={`p-3.5 rounded-xl text-xs ${
                      rep.is_official_coach_reply
                        ? 'bg-purple-50 border border-purple-200'
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-slate-900">{rep.author_name}</span>
                      {rep.is_official_coach_reply && (
                        <span className="text-[10px] font-extrabold text-purple-800 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                          Risposta Ufficiale Coach
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono-tabular ml-auto">
                        {rep.created_at.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{rep.body}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Reply Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={replyDrafts[thread.id] || ''}
                onChange={(e) =>
                  setReplyDrafts((prev) => ({ ...prev, [thread.id]: e.target.value }))
                }
                placeholder={
                  isCoach
                    ? 'Scrivi risposta ufficiale del Coach...'
                    : 'Aggiungi un commento o chiarimento...'
                }
                className="flex-1 min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={() => handleSendReply(thread.id)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Rispondi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
