/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export const MobileBottomNav: React.FC = () => {
  const { currentRoute, setCurrentRoute, currentUser } = useApp();
  const { t } = useTranslation();

  if (!currentRoute.startsWith('/app')) return null;

  const isCoach = currentUser.role === 'COACH';

  const items = isCoach
    ? [
        { route: '/app/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
        { route: '/app/community', label: t('nav.community'), icon: MessageSquare },
        { route: '/app/workouts', label: t('nav.workouts'), icon: Dumbbell },
        { route: '/app/nutrition', label: 'Nutrizione', icon: Utensils },
        { route: '/app/toolbox', label: 'Toolbox', icon: Sparkles },
      ]
    : [
        { route: '/app/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
        { route: '/app/workouts', label: t('nav.workouts'), icon: Dumbbell },
        { route: '/app/nutrition', label: 'Nutrizione', icon: Utensils },
        { route: '/app/community', label: 'Q&A', icon: MessageSquare },
        { route: '/app/toolbox', label: 'Toolbox', icon: Sparkles },
      ];

  return (
    <nav
      aria-label="Navigazione Mobile"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-1 py-1.5"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentRoute === item.route;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => setCurrentRoute(item.route)}
              className={`min-h-[46px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-bold transition-colors cursor-pointer ${
                active ? 'text-white bg-purple-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
