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
import { CommunityQaBoard } from './components/community/CommunityQaBoard';
import { NutritionHubView } from './components/nutrition/NutritionHubView';
import { HabitsToolboxView } from './components/toolbox/HabitsToolboxView';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MorningDomsModal } from './components/workouts/MorningDomsModal';
import { EngagementHubModals } from './components/engagement/EngagementHubModals';
import { OnboardingFunnelModal } from './components/onboarding/OnboardingFunnelModal';
import { Lock, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentRoute,
    currentUser,
    isEmailSchedulerModalOpen,
    setIsEmailSchedulerModalOpen,
    featureFlags,
    activeOnboardingStatus,
    onboardingApplications,
    setIsOnboardingModalOpen,
  } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCmsModalOpen, setIsCmsModalOpen] = useState(false);

  const isAppRoute = currentRoute.startsWith('/app');
  const currentAppRecord = onboardingApplications.find((a) => a.applicant_id === currentUser.id);

  const renderVipGate = (featureLabel: string) => (
    <div className="max-w-2xl mx-auto px-4 py-12 pb-24 lg:pb-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
          Funzionalità Esclusiva Tier 2 · VIP Coaching
        </div>
        <h2 className="text-xl font-black text-slate-900">
          {featureLabel} richiede l'approvazione VIP
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          Stato attuale del tuo profilo: <strong className="text-slate-900">{activeOnboardingStatus}</strong>.
          Puoi usare liberamente Workout Logger, Ricette & Porzioni a Mano, Bacheca Q&A Pubblica e Toolbox Abitudini.
        </p>
        {currentAppRecord?.discovery_call_link && activeOnboardingStatus === 'DISCOVERY_CALL_INVITED' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            Invito Discovery Call attivo: <code>{currentAppRecord.discovery_call_link}</code>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOnboardingModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Apri Questionario & Stato Upgrade VIP
        </button>
      </div>
    </div>
  );

  const renderRoute = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage onOpenCmsModal={() => setIsCmsModalOpen(true)} />;
      case '/login':
        return <LoginView />;
      case '/app/dashboard':
        return currentUser.role === 'COACH' ? <CoachDashboard /> : <AthleteDashboard />;
      case '/app/calendar':
        if (currentUser.role !== 'COACH' && !featureFlags.can_access_1on1_macrocycle) {
          return renderVipGate('Macrociclo 1-to-1 Personalizzato');
        }
        return <CalendarView />;
      case '/app/workouts':
        return <WorkoutsView />;
      case '/app/nutrition':
        return <NutritionHubView />;
      case '/app/community':
        return <CommunityQaBoard />;
      case '/app/toolbox':
        return <HabitsToolboxView />;
      case '/app/check-in':
        if (currentUser.role === 'COACH') return <CoachCheckInReview />;
        if (!featureFlags.can_submit_7step_checkin) {
          return renderVipGate('Check-In Settimanale 7 Aree');
        }
        return <CheckInWizard />;
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

      {/* Mobile-First Bottom Navigation */}
      <MobileBottomNav />

      {/* Full CMS Drawer for Coach Francesco */}
      {currentUser.role === 'COACH' && (
        <CoachCmsDrawer
          isOpen={isCmsModalOpen}
          onClose={() => setIsCmsModalOpen(false)}
        />
      )}

      {/* GDPR & ePrivacy Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Module 1, 2 & 7 Global Modals */}
      <MorningDomsModal />
      <EngagementHubModals />
      <OnboardingFunnelModal />

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
