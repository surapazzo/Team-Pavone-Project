/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { LoginView } from './components/auth/LoginView';
import { AthleteDashboard } from './components/dashboard/AthleteDashboard';
import { CoachDashboard } from './components/dashboard/CoachDashboard';
import { CalendarView } from './components/calendar/CalendarView';
import { WorkoutsView } from './components/workouts/WorkoutsView';
import { CheckInWizard } from './components/checkin/CheckInWizard';
import { CoachCheckInReview } from './components/checkin/CoachCheckInReview';
import { PrivacyGdprView } from './components/privacy/PrivacyGdprView';
import { CoachCmsDrawer } from './components/cms/CoachCmsDrawer';
import { CookieConsentBanner } from './components/cookie/CookieConsentBanner';
import { CheckInEmailSchedulerView } from './components/checkin/CheckInEmailSchedulerView';

const AppContent: React.FC = () => {
  const {
    currentRoute,
    currentUser,
    isEmailSchedulerModalOpen,
    setIsEmailSchedulerModalOpen,
  } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCmsModalOpen, setIsCmsModalOpen] = useState(false);

  const isAppRoute = currentRoute.startsWith('/app');

  const renderRoute = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage onOpenCmsModal={() => setIsCmsModalOpen(true)} />;
      case '/login':
        return <LoginView />;
      case '/app/dashboard':
        return currentUser.role === 'COACH' ? <CoachDashboard /> : <AthleteDashboard />;
      case '/app/calendar':
        return <CalendarView />;
      case '/app/workouts':
        return <WorkoutsView />;
      case '/app/check-in':
        return currentUser.role === 'COACH' ? <CoachCheckInReview /> : <CheckInWizard />;
      case '/app/privacy-gdpr':
        return <PrivacyGdprView />;
      default:
        return <LandingPage onOpenCmsModal={() => setIsCmsModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Sidebar for /app/* routes */}
      {isAppRoute && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenCmsModal={() => setIsCmsModalOpen(true)}
        />
      )}

      {/* Main Column */}
      <div className={`flex-1 flex flex-col min-w-0 ${isAppRoute ? 'lg:pl-72' : ''}`}>
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenCmsModal={() => setIsCmsModalOpen(true)}
        />

        {/* Content Body: light background for dashboard/app views for contrast, dark for landing */}
        <main className={`flex-1 ${isAppRoute ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
          {renderRoute()}
        </main>
      </div>

      {/* Full CMS Drawer for Coach Francesco */}
      {currentUser.role === 'COACH' && (
        <CoachCmsDrawer
          isOpen={isCmsModalOpen}
          onClose={() => setIsCmsModalOpen(false)}
        />
      )}

      {/* GDPR & ePrivacy Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Global Check-In Email Scheduler Modal */}
      {isEmailSchedulerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Automazione & Scheduler Email Check-In (Team Pavone)
              </span>
              <button
                onClick={() => setIsEmailSchedulerModalOpen(false)}
                className="text-slate-400 hover:text-white px-2.5 py-1 text-sm font-bold rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CheckInEmailSchedulerView
                isModal={true}
                onClose={() => setIsEmailSchedulerModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
