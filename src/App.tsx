/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { CoachEditorBar } from './components/layout/CoachEditorBar';
import { LandingPage } from './components/landing/LandingPage';
import { LoginView } from './components/auth/LoginView';
import { AthleteDashboard } from './components/dashboard/AthleteDashboard';
import { CoachDashboard } from './components/dashboard/CoachDashboard';
import { CalendarView } from './components/calendar/CalendarView';
import { WorkoutsView } from './components/workouts/WorkoutsView';
import { CheckInWizard } from './components/checkin/CheckInWizard';
import { CoachCheckInReview } from './components/checkin/CoachCheckInReview';
import { PrivacyGdprView } from './components/privacy/PrivacyGdprView';
import { PreMergeGateModal } from './components/testing/PreMergeGateModal';
import { ThemeCustomizerModal } from './components/theme/ThemeCustomizerModal';

const AppContent: React.FC = () => {
  const { currentRoute, currentUser } = useApp();

  const renderRoute = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage />;
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
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-purple-200 selection:text-purple-900">
      {/* Top Bar Coach CMS Editor on Landing Page */}
      {currentRoute === '/' && <CoachEditorBar />}

      {/* Primary Top Bar Contract Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderRoute()}
      </main>

      {/* Global Modals */}
      <PreMergeGateModal />
      <ThemeCustomizerModal />
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
