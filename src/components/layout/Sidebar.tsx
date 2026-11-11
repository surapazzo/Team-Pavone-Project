/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Dumbbell,
  ClipboardCheck,
  Shield,
  LogOut,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Edit3,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCmsModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenCmsModal }) => {
  const {
    currentRoute,
    setCurrentRoute,
    currentUser,
    switchUserRole,
    athletes,
    selectedAthleteId,
    setSelectedAthleteId,
    theme,
    setIsEmailSchedulerModalOpen,
  } = useApp();

  const isCoach = currentUser.role === 'COACH';

  const navItems = [
    {
      route: '/app/dashboard',
      label: 'Dashboard & KPI',
      icon: LayoutDashboard,
      badge: isCoach ? 'Panoramica CX' : 'Telemetria',
    },
    {
      route: '/app/calendar',
      label: 'Macrociclo & Fasi',
      icon: Calendar,
      badge: isCoach ? 'Planner' : '12+ Settimane',
    },
    {
      route: '/app/workouts',
      label: 'Schede & Nutrizione',
      icon: Dumbbell,
      badge: 'Video & Macros',
    },
    {
      route: '/app/check-in',
      label: 'Check-In Settimanale',
      icon: ClipboardCheck,
      badge: isCoach ? 'Revisione' : '7 Aree',
    },
    {
      route: '/app/privacy-gdpr',
      label: 'Privacy & GDPR',
      icon: Shield,
      badge: 'Art. 9 & Oblio',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => {
                setCurrentRoute('/');
                onClose();
              }}
              className="flex items-center gap-3 text-left group"
            >
              {theme.logo_url ? (
                <img
                  src={theme.logo_url}
                  alt="Logo Team Pavone"
                  className="w-10 h-10 object-contain rounded-xl p-1 bg-slate-900 border border-slate-800 shadow-md transition-transform group-hover:scale-105"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md transition-transform group-hover:scale-105"
                  style={{ backgroundColor: theme.accent_primary }}
                >
                  TP
                </div>
              )}
              <div>
                <span className="font-extrabold text-white text-base tracking-tight block">
                  {theme.brand_name}
                </span>
                <span className="text-[11px] font-semibold text-purple-400 block tracking-wide">
                  Coaching & Bodybuilding
                </span>
              </div>
            </button>
          </div>

          {/* Active Role Indicator Card */}
          <div className="p-4 mx-4 my-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Persona Autenticata
              </span>
              <span
                className="text-[10px] font-extrabold px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: isCoach ? '#6D28D9' : '#334155' }}
              >
                {isCoach ? 'HEAD COACH' : 'ATLETA'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                {currentUser.full_name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="truncate">
                <div className="font-bold text-white text-xs truncate">
                  {currentUser.full_name}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Quick Switch Role Toggle */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => switchUserRole(isCoach ? 'ATHLETE' : 'COACH')}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Passa a {isCoach ? 'Atleta (Luca)' : 'Coach (Pavone)'}
              </button>
            </div>
          </div>

          {/* If Coach: Athlete Switcher Selector */}
          {isCoach && (
            <div className="px-4 mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Atleta Attivo Roster
              </label>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {athletes.map((ath) => (
                  <option key={ath.id} value={ath.id}>
                    {ath.full_name} ({ath.experience_level})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;

              return (
                <button
                  key={item.route}
                  onClick={() => {
                    setCurrentRoute(item.route);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-purple-900/40 text-white border border-purple-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono-tabular px-1.5 py-0.5 rounded transition-colors ${
                      isActive ? 'bg-purple-800/80 text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          {/* If Coach: Open CMS Console button */}
          {isCoach && onOpenCmsModal && (
            <button
              onClick={() => {
                onOpenCmsModal();
                onClose();
              }}
              className="w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Gestione CMS Landing
            </button>
          )}

          {/* Email Scheduler Direct Button */}
          <button
            onClick={() => {
              setIsEmailSchedulerModalOpen(true);
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-purple-950/80 border border-purple-900/50 text-purple-200 transition-colors group"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform" />
              Scheduler Email Check-In
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => {
              setCurrentRoute('/');
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Vai al Sito Pubblico
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setCurrentRoute('/login');
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              Logout / Cambia Account
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
