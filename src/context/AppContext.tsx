/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  ThemeConfig,
  LandingContent,
  DailyLog,
  GarminFitActivity,
  MacrocycleWeek,
  CalendarEvent,
  WorkoutProgram,
  WeeklyCheckIn,
  GdprConsentRecord,
  SecurityAuditLog,
  StripeSubscriptionData,
} from '../types';
import {
  INITIAL_THEME,
  INITIAL_LANDING_CONTENT,
  COACH_USER,
  ATHLETES_LIST,
  INITIAL_DAILY_LOGS,
  INITIAL_MACROCYCLE_WEEKS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_WORKOUT_PROGRAMS,
  INITIAL_CHECKINS,
  INITIAL_STRIPE_DATA,
} from '../data/initialData';
import { exportAthleteDataAsJson, exportAthleteLogsAsCsv } from '../services/securityAndGdpr';

interface AppContextType {
  currentUser: UserProfile;
  athletes: UserProfile[];
  selectedAthleteId: string;
  selectedAthlete: UserProfile;
  theme: ThemeConfig;
  landingContent: LandingContent;
  dailyLogs: DailyLog[];
  garminActivities: GarminFitActivity[];
  macrocycleWeeks: MacrocycleWeek[];
  calendarEvents: CalendarEvent[];
  workoutPrograms: WorkoutProgram[];
  weeklyCheckins: WeeklyCheckIn[];
  stripeData: StripeSubscriptionData;
  gdprConsents: GdprConsentRecord[];
  auditLogs: SecurityAuditLog[];
  currentRoute: string;
  isPreMergeGateOpen: boolean;
  isThemeEditorOpen: boolean;
  
  // Navigation & Role Actions
  setCurrentRoute: (route: string) => void;
  switchUserRole: (role: UserRole, athleteId?: string) => void;
  setSelectedAthleteId: (id: string) => void;
  setIsPreMergeGateOpen: (open: boolean) => void;
  setIsThemeEditorOpen: (open: boolean) => void;

  // Domain Actions
  updateTheme: (updated: Partial<ThemeConfig>) => void;
  updateLandingContent: (updated: Partial<LandingContent>) => void;
  addDailyLog: (log: Omit<DailyLog, 'id'>) => void;
  importGarminFitActivity: (activity: Omit<GarminFitActivity, 'id' | 'imported_at'>) => void;
  updateMacrocycleWeek: (weekId: string, updated: Partial<MacrocycleWeek>) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;
  submitWeeklyCheckin: (checkin: Omit<WeeklyCheckIn, 'id' | 'submission_date' | 'review_status'>) => Promise<WeeklyCheckIn>;
  reviewCheckin: (checkinId: string, feedback: string) => void;
  saveWorkoutProgram: (program: WorkoutProgram) => void;

  // GDPR Actions
  acceptGdprConsent: (athleteId: string) => void;
  eraseAllAthleteData: (athleteId: string) => boolean;
  exportAthleteData: (format: 'json' | 'csv') => void;
  addAuditLog: (event: string, severity: 'INFO' | 'WARN' | 'ALERT', details?: Record<string, unknown>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current route
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  
  // Active user (default: Athlete Luca Puci to test athlete view, or switch to Coach)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedRole = localStorage.getItem('ttp_role');
    if (savedRole === 'COACH') return COACH_USER;
    return ATHLETES_LIST[0]; // Luca Puci
  });

  const [athletes] = useState<UserProfile[]>(ATHLETES_LIST);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(ATHLETES_LIST[0].id);

  // Selected athlete for Coach perspective
  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  // Theme
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('ttp_theme');
    return saved ? JSON.parse(saved) : INITIAL_THEME;
  });

  // Landing CMS Content
  const [landingContent, setLandingContent] = useState<LandingContent>(() => {
    const saved = localStorage.getItem('ttp_landing_content');
    return saved ? JSON.parse(saved) : INITIAL_LANDING_CONTENT;
  });

  // Daily Logs
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('ttp_daily_logs');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_LOGS;
  });

  // Garmin Activities
  const [garminActivities, setGarminActivities] = useState<GarminFitActivity[]>(() => {
    const saved = localStorage.getItem('ttp_garmin_activities');
    return saved ? JSON.parse(saved) : [];
  });

  // Macrocycle
  const [macrocycleWeeks, setMacrocycleWeeks] = useState<MacrocycleWeek[]>(() => {
    const saved = localStorage.getItem('ttp_macrocycle');
    return saved ? JSON.parse(saved) : INITIAL_MACROCYCLE_WEEKS;
  });

  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('ttp_calendar_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  // Workout Programs
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>(() => {
    const saved = localStorage.getItem('ttp_workouts');
    return saved ? JSON.parse(saved) : INITIAL_WORKOUT_PROGRAMS;
  });

  // Weekly Check-Ins
  const [weeklyCheckins, setWeeklyCheckins] = useState<WeeklyCheckIn[]>(() => {
    const saved = localStorage.getItem('ttp_checkins');
    return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
  });

  // Stripe
  const [stripeData] = useState<StripeSubscriptionData>(INITIAL_STRIPE_DATA);

  // GDPR & Auditing
  const [gdprConsents, setGdprConsents] = useState<GdprConsentRecord[]>([
    {
      id: 'cons-luca-1',
      athlete_id: 'athlete-luca-puci',
      art9_health_data_consent: true,
      consent_timestamp: '2026-01-05T10:00:00Z',
      ip_address: '151.48.20.14',
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([
    {
      id: 'aud-1',
      user_id: 'athlete-luca-puci',
      event_type: 'AUTH_LOGIN_SUCCESS',
      severity: 'INFO',
      ip_address: '151.48.20.14',
      details: { client: 'Mobile PWA Chrome/Android' },
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  // Modals
  const [isPreMergeGateOpen, setIsPreMergeGateOpen] = useState(false);
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);

  // Sync theme to CSS variables on root element
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-primary', theme.accent_primary);
    root.style.setProperty('--accent-secondary', theme.accent_secondary);
    root.style.setProperty('--bg-primary', theme.bg_primary);
    root.style.setProperty('--bg-secondary', theme.bg_secondary);
    root.style.setProperty('--text-primary', theme.text_primary);
    localStorage.setItem('ttp_theme', JSON.stringify(theme));
  }, [theme]);

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem('ttp_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('ttp_checkins', JSON.stringify(weeklyCheckins));
  }, [weeklyCheckins]);

  useEffect(() => {
    localStorage.setItem('ttp_landing_content', JSON.stringify(landingContent));
  }, [landingContent]);

  useEffect(() => {
    localStorage.setItem('ttp_macrocycle', JSON.stringify(macrocycleWeeks));
  }, [macrocycleWeeks]);

  const addAuditLog = (event: string, severity: 'INFO' | 'WARN' | 'ALERT', details: Record<string, unknown> = {}) => {
    const newLog: SecurityAuditLog = {
      id: `aud-${Date.now()}`,
      user_id: currentUser.id,
      event_type: event,
      severity,
      ip_address: '127.0.0.1',
      details,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchUserRole = (role: UserRole, athleteId?: string) => {
    if (role === 'COACH') {
      setCurrentUser(COACH_USER);
      localStorage.setItem('ttp_role', 'COACH');
      addAuditLog('ROLE_SWITCH_COACH', 'INFO', { target_role: 'COACH' });
    } else {
      const athlete = athletes.find((a) => a.id === (athleteId || selectedAthleteId)) || athletes[0];
      setCurrentUser(athlete);
      setSelectedAthleteId(athlete.id);
      localStorage.setItem('ttp_role', 'ATHLETE');
      addAuditLog('ROLE_SWITCH_ATHLETE', 'INFO', { target_athlete: athlete.full_name });
    }
  };

  const updateTheme = (updated: Partial<ThemeConfig>) => {
    setTheme((prev) => ({
      ...prev,
      ...updated,
      updated_at: new Date().toISOString(),
    }));
    addAuditLog('THEME_UPDATED', 'INFO', { changes: Object.keys(updated) });
  };

  const updateLandingContent = (updated: Partial<LandingContent>) => {
    setLandingContent((prev) => ({
      ...prev,
      ...updated,
    }));
    addAuditLog('CMS_LANDING_UPDATED', 'INFO', { updated_fields: Object.keys(updated) });
  };

  const addDailyLog = (logData: Omit<DailyLog, 'id'>) => {
    const existingIndex = dailyLogs.findIndex(
      (l) => l.athlete_id === logData.athlete_id && l.log_date === logData.log_date
    );
    if (existingIndex >= 0) {
      setDailyLogs((prev) => {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], ...logData };
        return copy;
      });
    } else {
      const newLog: DailyLog = {
        id: `log-${Date.now()}`,
        ...logData,
      };
      setDailyLogs((prev) => [...prev, newLog]);
    }
    addAuditLog('DAILY_LOG_UPSERTED', 'INFO', { date: logData.log_date, athlete_id: logData.athlete_id });
  };

  const importGarminFitActivity = (activityData: Omit<GarminFitActivity, 'id' | 'imported_at'>) => {
    const newAct: GarminFitActivity = {
      id: `garmin-${Date.now()}`,
      imported_at: new Date().toISOString(),
      ...activityData,
    };
    setGarminActivities((prev) => [newAct, ...prev]);

    // Automatically update workout_completed = true in daily_logs for this date
    addDailyLog({
      athlete_id: activityData.athlete_id,
      log_date: activityData.activity_date,
      workout_completed: true,
      calories_kcal: activityData.active_calories,
      steps: activityData.total_steps,
      sleep_hours: 8,
      weight_kg: 0,
      notes: `Sincronizzato da Garmin .FIT: ${activityData.duration_seconds / 60}m, FC media ${activityData.avg_heart_rate} bpm.`,
    });

    addAuditLog('GARMIN_FIT_IMPORTED', 'INFO', {
      file: activityData.file_name,
      duration_sec: activityData.duration_seconds,
      calories: activityData.active_calories,
    });
  };

  const updateMacrocycleWeek = (weekId: string, updated: Partial<MacrocycleWeek>) => {
    setMacrocycleWeeks((prev) =>
      prev.map((w) => (w.id === weekId ? { ...w, ...updated } : w))
    );
    addAuditLog('MACROCYCLE_WEEK_UPDATED', 'INFO', { weekId, updated_fields: Object.keys(updated) });
  };

  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      ...eventData,
    };
    setCalendarEvents((prev) => [...prev, newEvt]);
    addAuditLog('CALENDAR_EVENT_ADDED', 'INFO', { title: eventData.title, priority: eventData.priority });
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('CALENDAR_EVENT_DELETED', 'INFO', { id });
  };

  const submitWeeklyCheckin = async (
    checkinData: Omit<WeeklyCheckIn, 'id' | 'submission_date' | 'review_status'>
  ): Promise<WeeklyCheckIn> => {
    const newCheckin: WeeklyCheckIn = {
      id: `chk-${Date.now()}`,
      submission_date: new Date().toISOString(),
      review_status: 'PENDING',
      checkin_link: `https://app.teampavone.it/app/check-in/review/chk-${Date.now()}`,
      ...checkinData,
    };

    setWeeklyCheckins((prev) => [newCheckin, ...prev]);
    addAuditLog('CHECKIN_SUBMITTED', 'INFO', {
      athlete_id: checkinData.athlete_id,
      iso_week: checkinData.iso_week,
      weekly_rating: checkinData.weekly_rating,
    });

    return newCheckin;
  };

  const reviewCheckin = (checkinId: string, feedback: string) => {
    setWeeklyCheckins((prev) =>
      prev.map((c) =>
        c.id === checkinId ? { ...c, review_status: 'REVIEWED', coach_feedback: feedback } : c
      )
    );
    addAuditLog('CHECKIN_REVIEWED', 'INFO', { checkinId });
  };

  const saveWorkoutProgram = (program: WorkoutProgram) => {
    setWorkoutPrograms((prev) => {
      const idx = prev.findIndex((p) => p.id === program.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = program;
        return copy;
      }
      return [...prev, program];
    });
    addAuditLog('WORKOUT_PROGRAM_SAVED', 'INFO', { title: program.title });
  };

  const acceptGdprConsent = (athleteId: string) => {
    const newRecord: GdprConsentRecord = {
      id: `cons-${Date.now()}`,
      athlete_id: athleteId,
      art9_health_data_consent: true,
      consent_timestamp: new Date().toISOString(),
      ip_address: '127.0.0.1',
    };
    setGdprConsents((prev) => [newRecord, ...prev]);
    addAuditLog('GDPR_ART9_CONSENT_GRANTED', 'INFO', { athleteId });
  };

  const eraseAllAthleteData = (athleteId: string): boolean => {
    // 1-Click Erasure ("Diritto all'Oblio" GDPR Art. 17) with ON DELETE CASCADE behavior
    setDailyLogs((prev) => prev.filter((l) => l.athlete_id !== athleteId));
    setWeeklyCheckins((prev) => prev.filter((c) => c.athlete_id !== athleteId));
    setGarminActivities((prev) => prev.filter((g) => g.athlete_id !== athleteId));
    setMacrocycleWeeks((prev) => prev.filter((m) => m.athlete_id !== athleteId));
    setCalendarEvents((prev) => prev.filter((e) => e.athlete_id !== athleteId));
    setWorkoutPrograms((prev) => prev.filter((w) => w.athlete_id !== athleteId));
    setGdprConsents((prev) => prev.filter((g) => g.athlete_id !== athleteId));

    addAuditLog('GDPR_RIGHT_TO_FORGOTTEN_EXECUTED', 'ALERT', {
      erased_athlete_id: athleteId,
      status: 'ON_DELETE_CASCADE_COMPLETE',
    });

    return true;
  };

  const exportAthleteData = (format: 'json' | 'csv') => {
    const athleteLogs = dailyLogs.filter((l) => l.athlete_id === currentUser.id);
    const athleteCheckins = weeklyCheckins.filter((c) => c.athlete_id === currentUser.id);
    const athleteConsents = gdprConsents.filter((c) => c.athlete_id === currentUser.id);

    let content = '';
    let mimeType = '';
    let fileName = '';

    if (format === 'json') {
      content = exportAthleteDataAsJson(currentUser, athleteLogs, athleteCheckins, athleteConsents);
      mimeType = 'application/json';
      fileName = `teampavone_export_${currentUser.full_name.toLowerCase().replace(/\s+/g, '_')}.json`;
    } else {
      content = exportAthleteLogsAsCsv(athleteLogs);
      mimeType = 'text/csv';
      fileName = `teampavone_logs_${currentUser.full_name.toLowerCase().replace(/\s+/g, '_')}.csv`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addAuditLog('DATA_PORTABILITY_EXPORT', 'INFO', { format, athlete_id: currentUser.id });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        athletes,
        selectedAthleteId,
        selectedAthlete,
        theme,
        landingContent,
        dailyLogs,
        garminActivities,
        macrocycleWeeks,
        calendarEvents,
        workoutPrograms,
        weeklyCheckins,
        stripeData,
        gdprConsents,
        auditLogs,
        currentRoute,
        isPreMergeGateOpen,
        isThemeEditorOpen,
        setCurrentRoute,
        switchUserRole,
        setSelectedAthleteId,
        setIsPreMergeGateOpen,
        setIsThemeEditorOpen,
        updateTheme,
        updateLandingContent,
        addDailyLog,
        importGarminFitActivity,
        updateMacrocycleWeek,
        addCalendarEvent,
        deleteCalendarEvent,
        submitWeeklyCheckin,
        reviewCheckin,
        saveWorkoutProgram,
        acceptGdprConsent,
        eraseAllAthleteData,
        exportAthleteData,
        addAuditLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
