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
  GarminSleepLog,
  CookiePreferences,
  CheckInSchedulerConfig,
  CheckInEmailDispatchLog,
  CheckInSchedulerTriggerType,
  ExerciseLibraryItem,
  ExerciseItem,
  WorkoutSessionLog,
  MorningDomsLog,
  DomsMuscleScore,
  GamificationRecord,
  StepStreakState,
  EducationalDripModule,
  QaThread,
  QaTopic,
  HungerSatietyTarget,
  MealSatietyLog,
  HabitItem,
  HabitDailyLog,
  OnboardingApplication,
  SubscriptionTier,
  OnboardingStatus,
  TierFeatureFlags,
  SupportedLocale,
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
  INITIAL_EXERCISE_LIBRARY,
} from '../data/initialData';
import {
  INITIAL_WORKOUT_SESSIONS,
  INITIAL_MORNING_DOMS,
  INITIAL_GAMIFICATION_RECORDS,
  INITIAL_STEP_STREAK,
  INITIAL_EDUCATIONAL_DRIP_MODULES,
  INITIAL_QA_THREADS,
  INITIAL_HUNGER_TARGETS,
  INITIAL_SATIETY_LOGS,
  INITIAL_HABITS,
  INITIAL_HABIT_LOGS,
  INITIAL_ONBOARDING_APPLICATIONS,
} from '../data/upgradeSeedData';
import { exportAthleteDataAsJson, exportAthleteLogsAsCsv, sanitizeUserInput } from '../services/securityAndGdpr';
import {
  DEFAULT_SCHEDULER_CONFIG,
  INITIAL_DISPATCH_LOGS,
  calculateNextRunDate,
  executeSchedulerDispatch,
} from '../services/checkInEmailSchedulerService';

interface AppContextType {
  currentUser: UserProfile;
  athletes: UserProfile[];
  selectedAthleteId: string;
  selectedAthlete: UserProfile;
  theme: ThemeConfig;
  landingContent: LandingContent;
  dailyLogs: DailyLog[];
  garminActivities: GarminFitActivity[];
  garminSleepLogs: GarminSleepLog[];
  macrocycleWeeks: MacrocycleWeek[];
  calendarEvents: CalendarEvent[];
  workoutPrograms: WorkoutProgram[];
  weeklyCheckins: WeeklyCheckIn[];
  stripeData: StripeSubscriptionData;
  gdprConsents: GdprConsentRecord[];
  auditLogs: SecurityAuditLog[];
  cookiePreferences: CookiePreferences;
  isCookieModalOpen: boolean;
  currentRoute: string;
  isPreMergeGateOpen: boolean;
  isThemeEditorOpen: boolean;

  // Navigation & Role Actions
  setCurrentRoute: (route: string) => void;
  switchUserRole: (role: UserRole, athleteId?: string) => void;
  setSelectedAthleteId: (id: string) => void;
  setIsPreMergeGateOpen: (open: boolean) => void;
  setIsThemeEditorOpen: (open: boolean) => void;
  setIsCookieModalOpen: (open: boolean) => void;
  loginWithGoogle: (googleUser?: { email: string; name: string; avatarUrl?: string }) => void;
  logout: () => void;

  // Domain Actions
  updateTheme: (updated: Partial<ThemeConfig>) => void;
  updateLandingContent: (updated: Partial<LandingContent>) => void;
  updateCookiePreferences: (prefs: Partial<CookiePreferences>) => void;
  addDailyLog: (log: Omit<DailyLog, 'id'>) => void;
  bulkImportDailyLogs: (logs: DailyLog[]) => { importedCount: number; updatedCount: number };
  importGarminFitActivity: (activity: Omit<GarminFitActivity, 'id' | 'imported_at'>) => void;
  importGarminSleepActivity: (sleepLog: Omit<GarminSleepLog, 'id' | 'imported_at'>) => void;
  updateMacrocycleWeek: (weekId: string, updated: Partial<MacrocycleWeek>) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;
  submitWeeklyCheckin: (checkin: Omit<WeeklyCheckIn, 'id' | 'submission_date' | 'review_status'>) => Promise<WeeklyCheckIn>;
  reviewCheckin: (checkinId: string, feedback: string) => void;
  saveWorkoutProgram: (program: WorkoutProgram) => void;
  addExerciseToProgram: (programId: string, exercise: ExerciseItem) => void;

  // Exercise Library & Builder
  exerciseLibrary: ExerciseLibraryItem[];
  addExerciseToLibrary: (item: Omit<ExerciseLibraryItem, 'id' | 'updated_at'>) => ExerciseLibraryItem;
  updateExerciseInLibrary: (id: string, updated: Partial<ExerciseLibraryItem>) => void;
  deleteExerciseFromLibrary: (id: string) => void;

  // Check-In Email Scheduler
  schedulerConfig: CheckInSchedulerConfig;
  emailDispatchLogs: CheckInEmailDispatchLog[];
  isEmailSchedulerModalOpen: boolean;
  setIsEmailSchedulerModalOpen: (open: boolean) => void;
  updateSchedulerConfig: (updated: Partial<CheckInSchedulerConfig>) => void;
  triggerCheckInEmailDispatch: (checkinId?: string, triggerType?: CheckInSchedulerTriggerType) => Promise<CheckInEmailDispatchLog | null>;

  // GDPR Actions
  acceptGdprConsent: (athleteId: string) => void;
  eraseAllAthleteData: (athleteId: string) => boolean;
  exportAthleteData: (format: 'json' | 'csv') => void;
  addAuditLog: (event: string, severity: 'INFO' | 'WARN' | 'ALERT', details?: Record<string, unknown>) => void;

  // MODULE 1: Workout Sessions & Morning DOMS
  workoutSessions: WorkoutSessionLog[];
  morningDomsLogs: MorningDomsLog[];
  isMorningDomsModalOpen: boolean;
  setIsMorningDomsModalOpen: (open: boolean) => void;
  logWorkoutSession: (session: Omit<WorkoutSessionLog, 'id'>) => { session: WorkoutSessionLog; newRecords: GamificationRecord[] };
  submitMorningDoms: (hasSoreness: boolean, muscleScores: DomsMuscleScore[], workoutSessionId?: string) => void;

  // MODULE 2: Gamification, Streaks, Daily Touchpoints & Educational Drip
  gamificationRecords: GamificationRecord[];
  latestCelebrationRecord: GamificationRecord | null;
  dismissCelebrationRecord: () => void;
  stepStreak: StepStreakState;
  dripModules: EducationalDripModule[];
  completeDripModule: (moduleId: string) => void;
  isEndOfDayModalOpen: boolean;
  setIsEndOfDayModalOpen: (open: boolean) => void;
  isMorningBriefingOpen: boolean;
  setIsMorningBriefingOpen: (open: boolean) => void;
  isDripModalOpen: boolean;
  setIsDripModalOpen: (open: boolean) => void;

  // MODULE 3: Public Community Q&A Board
  qaThreads: QaThread[];
  createQaThread: (topic: QaTopic, title: string, body: string) => void;
  replyToQaThread: (threadId: string, body: string) => void;
  togglePinQaThread: (threadId: string) => void;

  // MODULE 4 & 5: Nutrition Targets, Hunger/Satiety Logger
  hungerTargets: HungerSatietyTarget[];
  updateHungerTarget: (mealType: 'MAIN_MEAL' | 'SNACK', pre: number, post: number) => void;
  satietyLogs: MealSatietyLog[];
  logPreMealHunger: (mealLabel: string, mealType: 'MAIN_MEAL' | 'SNACK', hungerScore: number) => void;
  logPostMealSatiety: (logId: string, satietyScore: number) => void;

  // MODULE 6: Habits & Evening Reflection
  habits: HabitItem[];
  habitLogs: HabitDailyLog[];
  addHabitItem: (titleIt: string, titleEn: string, weeklyTargetDays: number, category: HabitItem['category']) => void;
  toggleHabitCompletion: (habitId: string, logDate?: string) => void;
  saveEveningReflection: (energyScore: number, challengeNote: string, logDate?: string) => void;

  // MODULE 7: Qualifying Onboarding Funnel & Feature Flags
  onboardingApplications: OnboardingApplication[];
  activeTier: SubscriptionTier;
  activeOnboardingStatus: OnboardingStatus;
  featureFlags: TierFeatureFlags;
  isOnboardingModalOpen: boolean;
  setIsOnboardingModalOpen: (open: boolean) => void;
  submitOnboardingApplication: (payload: {
    applicant_name: string;
    applicant_email: string;
    selected_tier: SubscriptionTier;
    primary_goal: string;
    training_experience: string;
    weekly_availability_days: number;
    injuries_or_notes: string;
    commitment_score: number;
  }) => OnboardingApplication;
  inviteToDiscoveryCall: (applicationId: string, callLink: string) => void;
  approveVipApplication: (applicationId: string) => void;

  // MODULE 8: i18n
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale) => void;
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

  // Theme with official Team Pavone branding
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('ttp_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.logo_url || parsed.logo_url.includes('unsplash') || parsed.logo_url === '') {
          parsed.logo_url = INITIAL_THEME.logo_url;
        }
        return parsed;
      } catch {
        return INITIAL_THEME;
      }
    }
    return INITIAL_THEME;
  });

  // Landing CMS Content with teampavone.com assets
  const [landingContent, setLandingContent] = useState<LandingContent>(() => {
    const saved = localStorage.getItem('ttp_landing_content');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate stale or unsplash placeholders to authentic teampavone.com photos
        if (!parsed.hero_image_url || parsed.hero_image_url.includes('unsplash')) {
          parsed.hero_image_url = INITIAL_LANDING_CONTENT.hero_image_url;
        }
        if (!parsed.coach_portrait_url || parsed.coach_portrait_url.includes('unsplash')) {
          parsed.coach_portrait_url = INITIAL_LANDING_CONTENT.coach_portrait_url;
        }
        if (!parsed.testimonials || parsed.testimonials.length < 6 || (parsed.testimonials[0]?.before_after_url && parsed.testimonials[0].before_after_url.includes('unsplash'))) {
          parsed.testimonials = INITIAL_LANDING_CONTENT.testimonials;
        }
        return parsed;
      } catch {
        return INITIAL_LANDING_CONTENT;
      }
    }
    return INITIAL_LANDING_CONTENT;
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

  // Garmin Sleep Logs
  const [garminSleepLogs, setGarminSleepLogs] = useState<GarminSleepLog[]>(() => {
    const saved = localStorage.getItem('ttp_garmin_sleep_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Cookie Consent & Preferences
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>(() => {
    const saved = localStorage.getItem('ttp_cookie_consent');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      necessary: true,
      preferences: true,
      analytics: false,
      timestamp: '',
      hasConsented: false,
    };
  });
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  // Macrocycle
  const [macrocycleWeeks, setMacrocycleWeeks] = useState<MacrocycleWeek[]>(() => {
    const saved = localStorage.getItem('ttp_macrocycle');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_MACROCYCLE_WEEKS.length) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_MACROCYCLE_WEEKS;
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

  // Master Exercise Library (Francesco Pavone Catalog)
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseLibraryItem[]>(() => {
    const saved = localStorage.getItem('ttp_exercise_library');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_EXERCISE_LIBRARY;
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

  // Check-In Email Scheduler State
  const [schedulerConfig, setSchedulerConfig] = useState<CheckInSchedulerConfig>(() => {
    const saved = localStorage.getItem('ttp_checkin_scheduler');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_SCHEDULER_CONFIG;
  });

  const [emailDispatchLogs, setEmailDispatchLogs] = useState<CheckInEmailDispatchLog[]>(() => {
    const saved = localStorage.getItem('ttp_checkin_email_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_DISPATCH_LOGS;
  });

  const [isEmailSchedulerModalOpen, setIsEmailSchedulerModalOpen] = useState(false);

  // Modals
  const [isPreMergeGateOpen, setIsPreMergeGateOpen] = useState(false);
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);

  // MODULE 1-8 STATES
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    const saved = localStorage.getItem('ttp_locale');
    return (saved as SupportedLocale) || 'it';
  });
  const setLocale = (loc: SupportedLocale) => {
    setLocaleState(loc);
    localStorage.setItem('ttp_locale', loc);
  };

  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSessionLog[]>(() => {
    const saved = localStorage.getItem('ttp_workout_sessions');
    return saved ? JSON.parse(saved) : INITIAL_WORKOUT_SESSIONS;
  });

  const [morningDomsLogs, setMorningDomsLogs] = useState<MorningDomsLog[]>(() => {
    const saved = localStorage.getItem('ttp_morning_doms');
    return saved ? JSON.parse(saved) : INITIAL_MORNING_DOMS;
  });
  const [isMorningDomsModalOpen, setIsMorningDomsModalOpen] = useState(false);

  const [gamificationRecords, setGamificationRecords] = useState<GamificationRecord[]>(() => {
    const saved = localStorage.getItem('ttp_gamification_records');
    return saved ? JSON.parse(saved) : INITIAL_GAMIFICATION_RECORDS;
  });
  const [latestCelebrationRecord, setLatestCelebrationRecord] = useState<GamificationRecord | null>(null);
  const dismissCelebrationRecord = () => setLatestCelebrationRecord(null);

  const [stepStreak, setStepStreak] = useState<StepStreakState>(() => {
    const saved = localStorage.getItem('ttp_step_streak');
    return saved ? JSON.parse(saved) : INITIAL_STEP_STREAK;
  });

  const [dripModules, setDripModules] = useState<EducationalDripModule[]>(() => {
    const saved = localStorage.getItem('ttp_drip_modules');
    return saved ? JSON.parse(saved) : INITIAL_EDUCATIONAL_DRIP_MODULES;
  });

  const [isEndOfDayModalOpen, setIsEndOfDayModalOpen] = useState(false);
  const [isMorningBriefingOpen, setIsMorningBriefingOpen] = useState(false);
  const [isDripModalOpen, setIsDripModalOpen] = useState(false);

  const [qaThreads, setQaThreads] = useState<QaThread[]>(() => {
    const saved = localStorage.getItem('ttp_qa_threads');
    return saved ? JSON.parse(saved) : INITIAL_QA_THREADS;
  });

  const [hungerTargets, setHungerTargets] = useState<HungerSatietyTarget[]>(() => {
    const saved = localStorage.getItem('ttp_hunger_targets');
    return saved ? JSON.parse(saved) : INITIAL_HUNGER_TARGETS;
  });

  const [satietyLogs, setSatietyLogs] = useState<MealSatietyLog[]>(() => {
    const saved = localStorage.getItem('ttp_satiety_logs');
    return saved ? JSON.parse(saved) : INITIAL_SATIETY_LOGS;
  });

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem('ttp_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [habitLogs, setHabitLogs] = useState<HabitDailyLog[]>(() => {
    const saved = localStorage.getItem('ttp_habit_logs');
    return saved ? JSON.parse(saved) : INITIAL_HABIT_LOGS;
  });

  const [onboardingApplications, setOnboardingApplications] = useState<OnboardingApplication[]>(() => {
    const saved = localStorage.getItem('ttp_onboarding_apps');
    return saved ? JSON.parse(saved) : INITIAL_ONBOARDING_APPLICATIONS;
  });
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

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

  const bulkImportDailyLogs = (logs: DailyLog[]) => {
    let importedCount = 0;
    let updatedCount = 0;

    setDailyLogs((prev) => {
      const copy = [...prev];
      logs.forEach((newLog) => {
        const existingIdx = copy.findIndex(
          (l) => l.athlete_id === newLog.athlete_id && l.log_date === newLog.log_date
        );
        if (existingIdx >= 0) {
          copy[existingIdx] = {
            ...copy[existingIdx],
            ...newLog,
            // preserve existing non-zero values if new values are zero
            weight_kg: newLog.weight_kg > 0 ? newLog.weight_kg : copy[existingIdx].weight_kg,
            calories_kcal: newLog.calories_kcal > 0 ? newLog.calories_kcal : copy[existingIdx].calories_kcal,
            steps: newLog.steps > 0 ? newLog.steps : copy[existingIdx].steps,
          };
          updatedCount++;
        } else {
          copy.push(newLog);
          importedCount++;
        }
      });
      return copy;
    });

    addAuditLog('EXCEL_BULK_LOGS_IMPORTED', 'INFO', {
      total: logs.length,
      imported: importedCount,
      updated: updatedCount,
    });

    return { importedCount, updatedCount };
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

  const importGarminSleepActivity = (sleepData: Omit<GarminSleepLog, 'id' | 'imported_at'>) => {
    const newSleep: GarminSleepLog = {
      id: `sleep-${Date.now()}`,
      imported_at: new Date().toISOString(),
      ...sleepData,
    };
    setGarminSleepLogs((prev) => {
      const updated = [newSleep, ...prev];
      localStorage.setItem('ttp_garmin_sleep_logs', JSON.stringify(updated));
      return updated;
    });

    // Automatically update or create daily_logs for this date
    setDailyLogs((prev) => {
      const existingIndex = prev.findIndex(
        (l) => l.athlete_id === sleepData.athlete_id && l.log_date === sleepData.sleep_date
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          sleep_hours: sleepData.total_sleep_hours,
          notes:
            (copy[existingIndex].notes ? copy[existingIndex].notes + ' · ' : '') +
            `Garmin Sleep Score: ${sleepData.sleep_score}/100 (${sleepData.quality_rating}), HRV ${sleepData.avg_hrv_ms}ms`,
        };
        localStorage.setItem('ttp_daily_logs', JSON.stringify(copy));
        return copy;
      } else {
        const newLog: DailyLog = {
          id: `log-${Date.now()}`,
          athlete_id: sleepData.athlete_id,
          log_date: sleepData.sleep_date,
          weight_kg: 0,
          calories_kcal: 2300,
          steps: 10000,
          sleep_hours: sleepData.total_sleep_hours,
          workout_completed: false,
          notes: `Garmin Sleep Score: ${sleepData.sleep_score}/100 (${sleepData.quality_rating}), HRV ${sleepData.avg_hrv_ms}ms`,
        };
        const updated = [...prev, newLog];
        localStorage.setItem('ttp_daily_logs', JSON.stringify(updated));
        return updated;
      }
    });

    addAuditLog('GARMIN_FIT_SLEEP_IMPORTED', 'INFO', {
      file: sleepData.file_name,
      sleep_date: sleepData.sleep_date,
      total_sleep_hours: sleepData.total_sleep_hours,
      sleep_score: sleepData.sleep_score,
      hrv_ms: sleepData.avg_hrv_ms,
    });
  };

  const updateCookiePreferences = (prefs: Partial<CookiePreferences>) => {
    setCookiePreferences((prev) => {
      const updated: CookiePreferences = {
        ...prev,
        ...prefs,
        necessary: true,
        timestamp: new Date().toISOString(),
        hasConsented: true,
      };
      localStorage.setItem('ttp_cookie_consent', JSON.stringify(updated));
      return updated;
    });
    addAuditLog('COOKIE_CONSENT_UPDATED', 'INFO', prefs as Record<string, unknown>);
  };

  const loginWithGoogle = (googleUser?: { email: string; name: string; avatarUrl?: string }) => {
    const emailToUse = googleUser?.email || 'surapazzo@gmail.com';
    const nameToUse = googleUser?.name || 'Utente Google';

    let loggedUser: UserProfile;
    if (emailToUse.toLowerCase().includes('pavone') || emailToUse.toLowerCase().includes('coach')) {
      loggedUser = COACH_USER;
    } else {
      const existing = athletes.find((a) => a.email.toLowerCase() === emailToUse.toLowerCase());
      if (existing) {
        loggedUser = existing;
      } else {
        loggedUser = {
          id: `athlete-${Date.now()}`,
          role: 'ATHLETE',
          email: emailToUse,
          full_name: nameToUse,
          target_weight_kg: 78.0,
          initial_weight_kg: 83.5,
          experience_level: 'TWO_TO_FOUR_YEARS',
          created_at: new Date().toISOString(),
        };
      }
    }

    setCurrentUser(loggedUser);
    localStorage.setItem('ttp_role', loggedUser.role);
    localStorage.setItem('ttp_user', JSON.stringify(loggedUser));
    addAuditLog('AUTH_LOGIN_GOOGLE_SUCCESS', 'INFO', { email: emailToUse, name: nameToUse });
    setCurrentRoute('/app/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('ttp_role');
    localStorage.removeItem('ttp_user');
    addAuditLog('AUTH_LOGOUT', 'INFO', { user_id: currentUser.id });
    setCurrentRoute('/login');
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

  const updateSchedulerConfig = (updated: Partial<CheckInSchedulerConfig>) => {
    setSchedulerConfig((prev) => {
      const merged: CheckInSchedulerConfig = { ...prev, ...updated };
      if (updated.day_of_week || updated.send_time) {
        merged.next_scheduled_run = calculateNextRunDate(
          merged.day_of_week,
          merged.send_time
        );
      }
      localStorage.setItem('ttp_checkin_scheduler', JSON.stringify(merged));
      return merged;
    });
    addAuditLog('CHECKIN_SCHEDULER_CONFIG_UPDATED', 'INFO', updated as Record<string, unknown>);
  };

  const triggerCheckInEmailDispatch = async (
    checkinId?: string,
    triggerType: CheckInSchedulerTriggerType = 'MANUAL_DISPATCH'
  ): Promise<CheckInEmailDispatchLog | null> => {
    const targetCheckin = checkinId
      ? weeklyCheckins.find((c) => c.id === checkinId)
      : weeklyCheckins[0];

    if (!targetCheckin) return null;

    const targetAthlete =
      athletes.find((a) => a.id === targetCheckin.athlete_id) || currentUser;

    const latestSleep = garminSleepLogs.length > 0 ? garminSleepLogs[0] : null;

    const dispatchLog = await executeSchedulerDispatch(
      schedulerConfig,
      targetCheckin,
      targetAthlete,
      triggerType,
      latestSleep
    );

    setEmailDispatchLogs((prev) => {
      const updated = [dispatchLog, ...prev];
      localStorage.setItem('ttp_checkin_email_logs', JSON.stringify(updated));
      return updated;
    });

    setSchedulerConfig((prev) => {
      const updated = {
        ...prev,
        last_run_timestamp: new Date().toISOString(),
        next_scheduled_run: calculateNextRunDate(prev.day_of_week, prev.send_time),
      };
      localStorage.setItem('ttp_checkin_scheduler', JSON.stringify(updated));
      return updated;
    });

    addAuditLog('CHECKIN_EMAIL_DISPATCHED', 'INFO', {
      dispatchId: dispatchLog.id,
      recipient: dispatchLog.recipient_email,
      triggerType,
      latencyMs: dispatchLog.delivery_time_ms,
    });

    return dispatchLog;
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

    // Auto-dispatch scheduled report if enabled
    if (schedulerConfig.enabled && schedulerConfig.send_report_to_coach) {
      triggerCheckInEmailDispatch(newCheckin.id, 'CHECKIN_REPORT_SUBMISSION');
    }

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
        localStorage.setItem('ttp_workouts', JSON.stringify(copy));
        return copy;
      }
      const updated = [...prev, program];
      localStorage.setItem('ttp_workouts', JSON.stringify(updated));
      return updated;
    });
    addAuditLog('WORKOUT_PROGRAM_SAVED', 'INFO', { title: program.title });
  };

  const addExerciseToProgram = (programId: string, exercise: ExerciseItem) => {
    setWorkoutPrograms((prev) => {
      const idx = prev.findIndex((p) => p.id === programId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          exercises: [...copy[idx].exercises, exercise],
        };
        localStorage.setItem('ttp_workouts', JSON.stringify(copy));
        return copy;
      }
      return prev;
    });
    addAuditLog('EXERCISE_ADDED_TO_PROGRAM', 'INFO', { programId, exerciseName: exercise.name });
  };

  const addExerciseToLibrary = (item: Omit<ExerciseLibraryItem, 'id' | 'updated_at'>): ExerciseLibraryItem => {
    const newEx: ExerciseLibraryItem = {
      ...item,
      id: `lib-ex-${Date.now()}`,
      updated_at: new Date().toISOString(),
    };
    setExerciseLibrary((prev) => {
      const updated = [newEx, ...prev];
      localStorage.setItem('ttp_exercise_library', JSON.stringify(updated));
      return updated;
    });
    addAuditLog('EXERCISE_LIBRARY_CREATED', 'INFO', { name: newEx.name, muscle_group: newEx.muscle_group });
    return newEx;
  };

  const updateExerciseInLibrary = (id: string, updated: Partial<ExerciseLibraryItem>) => {
    setExerciseLibrary((prev) => {
      const copy = prev.map((ex) => (ex.id === id ? { ...ex, ...updated, updated_at: new Date().toISOString() } : ex));
      localStorage.setItem('ttp_exercise_library', JSON.stringify(copy));
      return copy;
    });
    addAuditLog('EXERCISE_LIBRARY_UPDATED', 'INFO', { id, ...updated });
  };

  const deleteExerciseFromLibrary = (id: string) => {
    setExerciseLibrary((prev) => {
      const filtered = prev.filter((ex) => ex.id !== id);
      localStorage.setItem('ttp_exercise_library', JSON.stringify(filtered));
      return filtered;
    });
    addAuditLog('EXERCISE_LIBRARY_DELETED', 'INFO', { id });
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

  // ============================================================================
  // MODULE 1-8 ACTIONS
  // ============================================================================
  const logWorkoutSession = (sessionData: Omit<WorkoutSessionLog, 'id'>) => {
    const newSession: WorkoutSessionLog = {
      ...sessionData,
      id: `ws-${Date.now()}`,
      notes: sessionData.notes ? sanitizeUserInput(sessionData.notes) : undefined,
    };

    const newRecords: GamificationRecord[] = [];
    const prevSessions = workoutSessions.filter((s) => s.athlete_id === sessionData.athlete_id);
    const maxPrevSessionVolume = prevSessions.reduce((max, s) => Math.max(max, s.total_tonnage_kg), 0);

    if (newSession.total_tonnage_kg > maxPrevSessionVolume && newSession.total_tonnage_kg > 0) {
      newRecords.push({
        id: `pr-vol-${Date.now()}`,
        athlete_id: sessionData.athlete_id,
        record_type: 'VOLUME',
        scope: 'SESSION',
        exercise_name: newSession.split_day,
        value: Math.round(newSession.total_tonnage_kg),
        unit: 'kg tonnellaggio',
        achieved_at: new Date().toISOString(),
        celebrated: false,
      });
    }

    // Check est. 1RM PR per exercise (Epley formula: w * (1 + r/30))
    const prevExerciseBest: Record<string, number> = {};
    prevSessions.forEach((s) => {
      s.sets.forEach((st) => {
        const e1rm = st.weight_kg * (1 + st.reps / 30);
        if (!prevExerciseBest[st.exercise_name] || e1rm > prevExerciseBest[st.exercise_name]) {
          prevExerciseBest[st.exercise_name] = e1rm;
        }
      });
    });

    const sessionExerciseBest: Record<string, number> = {};
    newSession.sets.forEach((st) => {
      if (!st.completed || st.weight_kg <= 0) return;
      const e1rm = Number((st.weight_kg * (1 + st.reps / 30)).toFixed(1));
      if (!sessionExerciseBest[st.exercise_name] || e1rm > sessionExerciseBest[st.exercise_name]) {
        sessionExerciseBest[st.exercise_name] = e1rm;
      }
    });

    Object.entries(sessionExerciseBest).forEach(([exName, best]) => {
      if (best > (prevExerciseBest[exName] || 0)) {
        newRecords.push({
          id: `pr-1rm-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          athlete_id: sessionData.athlete_id,
          record_type: 'EST_1RM',
          scope: 'EXERCISE',
          exercise_name: exName,
          value: best,
          unit: 'kg (e1RM)',
          achieved_at: new Date().toISOString(),
          celebrated: false,
        });
      }
    });

    setWorkoutSessions((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem('ttp_workout_sessions', JSON.stringify(updated));
      return updated;
    });

    if (newRecords.length > 0) {
      setGamificationRecords((prev) => {
        const updated = [...newRecords, ...prev];
        localStorage.setItem('ttp_gamification_records', JSON.stringify(updated));
        return updated;
      });
      setLatestCelebrationRecord(newRecords[0]);
    }

    addAuditLog('WORKOUT_SESSION_LOGGED', 'INFO', {
      split: newSession.split_day,
      duration_min: newSession.session_duration_minutes,
      tonnage: newSession.total_tonnage_kg,
      prs_unlocked: newRecords.length,
    });

    return { session: newSession, newRecords };
  };

  const submitMorningDoms = (
    hasSoreness: boolean,
    muscleScores: DomsMuscleScore[],
    workoutSessionId?: string
  ) => {
    const newDoms: MorningDomsLog = {
      id: `doms-${Date.now()}`,
      athlete_id: currentUser.role === 'COACH' ? selectedAthleteId : currentUser.id,
      workout_session_id: workoutSessionId,
      log_date: new Date().toISOString().split('T')[0],
      has_soreness: hasSoreness,
      muscle_scores: hasSoreness ? muscleScores : [],
      created_at: new Date().toISOString(),
    };
    setMorningDomsLogs((prev) => {
      const updated = [newDoms, ...prev];
      localStorage.setItem('ttp_morning_doms', JSON.stringify(updated));
      return updated;
    });
    setIsMorningDomsModalOpen(false);
    addAuditLog('MORNING_DOMS_LOGGED', 'INFO', {
      has_soreness: hasSoreness,
      muscles: muscleScores.map((m) => `${m.muscle}:${m.soreness}`).join(','),
    });
  };

  const completeDripModule = (moduleId: string) => {
    const targetId = currentUser.role === 'COACH' ? selectedAthleteId : currentUser.id;
    setDripModules((prev) => {
      const updated = prev.map((m) =>
        m.id === moduleId && !m.completed_by_athlete_ids.includes(targetId)
          ? { ...m, completed_by_athlete_ids: [...m.completed_by_athlete_ids, targetId] }
          : m
      );
      localStorage.setItem('ttp_drip_modules', JSON.stringify(updated));
      return updated;
    });
  };

  const createQaThread = (topic: QaTopic, title: string, body: string) => {
    const cleanTitle = sanitizeUserInput(title);
    const cleanBody = sanitizeUserInput(body);
    if (!cleanTitle || !cleanBody) return;

    const newThread: QaThread = {
      id: `qa-${Date.now()}`,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      topic,
      title: cleanTitle,
      body: cleanBody,
      is_pinned: false,
      created_at: new Date().toISOString(),
      replies: [],
    };
    setQaThreads((prev) => {
      const updated = [newThread, ...prev];
      localStorage.setItem('ttp_qa_threads', JSON.stringify(updated));
      return updated;
    });
    addAuditLog('QA_THREAD_CREATED', 'INFO', { topic, title: cleanTitle });
  };

  const replyToQaThread = (threadId: string, body: string) => {
    const cleanBody = sanitizeUserInput(body);
    if (!cleanBody) return;

    setQaThreads((prev) => {
      const updated = prev.map((th) => {
        if (th.id !== threadId) return th;
        return {
          ...th,
          replies: [
            ...th.replies,
            {
              id: `qar-${Date.now()}`,
              thread_id: threadId,
              author_id: currentUser.id,
              author_name: currentUser.full_name,
              author_role: currentUser.role,
              body: cleanBody,
              is_official_coach_reply: currentUser.role === 'COACH',
              created_at: new Date().toISOString(),
            },
          ],
        };
      });
      localStorage.setItem('ttp_qa_threads', JSON.stringify(updated));
      return updated;
    });
  };

  const togglePinQaThread = (threadId: string) => {
    if (currentUser.role !== 'COACH') return;
    setQaThreads((prev) => {
      const updated = prev.map((th) => (th.id === threadId ? { ...th, is_pinned: !th.is_pinned } : th));
      localStorage.setItem('ttp_qa_threads', JSON.stringify(updated));
      return updated;
    });
  };

  const updateHungerTarget = (mealType: 'MAIN_MEAL' | 'SNACK', pre: number, post: number) => {
    setHungerTargets((prev) => {
      const updated = prev.map((ht) =>
        ht.meal_type === mealType ? { ...ht, target_pre_hunger: pre, target_post_satiety: post } : ht
      );
      localStorage.setItem('ttp_hunger_targets', JSON.stringify(updated));
      return updated;
    });
  };

  const logPreMealHunger = (mealLabel: string, mealType: 'MAIN_MEAL' | 'SNACK', hungerScore: number) => {
    const now = Date.now();
    const newLog: MealSatietyLog = {
      id: `sat-${now}`,
      athlete_id: currentUser.role === 'COACH' ? selectedAthleteId : currentUser.id,
      meal_label: sanitizeUserInput(mealLabel) || 'Pasto',
      meal_type: mealType,
      pre_meal_hunger: hungerScore,
      logged_at: new Date(now).toISOString(),
      satiety_prompt_due_at: new Date(now + 60 * 60000).toISOString(),
    };
    setSatietyLogs((prev) => {
      const updated = [newLog, ...prev];
      localStorage.setItem('ttp_satiety_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const logPostMealSatiety = (logId: string, satietyScore: number) => {
    setSatietyLogs((prev) => {
      const updated = prev.map((l) =>
        l.id === logId
          ? { ...l, post_meal_satiety: satietyScore, satiety_completed_at: new Date().toISOString() }
          : l
      );
      localStorage.setItem('ttp_satiety_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const addHabitItem = (
    titleIt: string,
    titleEn: string,
    weeklyTargetDays: number,
    category: HabitItem['category']
  ) => {
    const targetId = currentUser.role === 'COACH' ? selectedAthleteId : currentUser.id;
    const newHab: HabitItem = {
      id: `hab-${Date.now()}`,
      athlete_id: targetId,
      title_it: sanitizeUserInput(titleIt),
      title_en: sanitizeUserInput(titleEn || titleIt),
      weekly_target_days: weeklyTargetDays,
      category,
    };
    setHabits((prev) => {
      const updated = [...prev, newHab];
      localStorage.setItem('ttp_habits', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleHabitCompletion = (habitId: string, logDate?: string) => {
    const dateKey = logDate || new Date().toISOString().split('T')[0];
    const targetId = currentUser.role === 'COACH' ? selectedAthleteId : currentUser.id;
    setHabitLogs((prev) => {
      const idx = prev.findIndex((l) => l.athlete_id === targetId && l.log_date === dateKey);
      let updated: HabitDailyLog[];
      if (idx >= 0) {
        updated = [...prev];
        const exists = updated[idx].completed_habit_ids.includes(habitId);
        updated[idx] = {
          ...updated[idx],
          completed_habit_ids: exists
            ? updated[idx].completed_habit_ids.filter((id) => id !== habitId)
            : [...updated[idx].completed_habit_ids, habitId],
        };
      } else {
        updated = [
          {
            id: `hlog-${Date.now()}`,
            athlete_id: targetId,
            log_date: dateKey,
            completed_habit_ids: [habitId],
          },
          ...prev,
        ];
      }
      localStorage.setItem('ttp_habit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const saveEveningReflection = (energyScore: number, challengeNote: string, logDate?: string) => {
    const dateKey = logDate || new Date().toISOString().split('T')[0];
    const targetId = currentUser.role === 'COACH' ? selectedAthleteId : currentUser.id;
    const cleanNote = sanitizeUserInput(challengeNote);
    setHabitLogs((prev) => {
      const idx = prev.findIndex((l) => l.athlete_id === targetId && l.log_date === dateKey);
      let updated: HabitDailyLog[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          evening_energy_score: energyScore,
          evening_challenge_note: cleanNote,
        };
      } else {
        updated = [
          {
            id: `hlog-${Date.now()}`,
            athlete_id: targetId,
            log_date: dateKey,
            completed_habit_ids: [],
            evening_energy_score: energyScore,
            evening_challenge_note: cleanNote,
          },
          ...prev,
        ];
      }
      localStorage.setItem('ttp_habit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const submitOnboardingApplication: AppContextType['submitOnboardingApplication'] = (payload) => {
    const isEntry = payload.selected_tier === 'TIER_1_ENTRY';
    const newApp: OnboardingApplication = {
      id: `onb-${Date.now()}`,
      applicant_id: currentUser.id,
      applicant_name: sanitizeUserInput(payload.applicant_name),
      applicant_email: sanitizeUserInput(payload.applicant_email),
      selected_tier: payload.selected_tier,
      status: isEntry ? 'TIER_1_ACTIVE' : 'PENDING_COACH_REVIEW',
      primary_goal: sanitizeUserInput(payload.primary_goal),
      training_experience: sanitizeUserInput(payload.training_experience),
      weekly_availability_days: payload.weekly_availability_days,
      injuries_or_notes: sanitizeUserInput(payload.injuries_or_notes),
      commitment_score: payload.commitment_score,
      stripe_checkout_completed: isEntry,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setOnboardingApplications((prev) => {
      const filtered = prev.filter((a) => a.applicant_id !== currentUser.id);
      const updated = [newApp, ...filtered];
      localStorage.setItem('ttp_onboarding_apps', JSON.stringify(updated));
      return updated;
    });
    addAuditLog('ONBOARDING_SUBMITTED', 'INFO', {
      tier: payload.selected_tier,
      status: newApp.status,
    });
    return newApp;
  };

  const inviteToDiscoveryCall = (applicationId: string, callLink: string) => {
    setOnboardingApplications((prev) => {
      const updated = prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'DISCOVERY_CALL_INVITED' as OnboardingStatus,
              discovery_call_link: sanitizeUserInput(callLink),
              updated_at: new Date().toISOString(),
            }
          : a
      );
      localStorage.setItem('ttp_onboarding_apps', JSON.stringify(updated));
      return updated;
    });
    addAuditLog('VIP_DISCOVERY_CALL_INVITED', 'INFO', { applicationId });
  };

  const approveVipApplication = (applicationId: string) => {
    setOnboardingApplications((prev) => {
      const updated = prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'TIER_2_APPROVED' as OnboardingStatus,
              stripe_checkout_completed: true,
              updated_at: new Date().toISOString(),
            }
          : a
      );
      localStorage.setItem('ttp_onboarding_apps', JSON.stringify(updated));
      return updated;
    });
    addAuditLog('VIP_COACHING_APPROVED', 'INFO', { applicationId });
  };

  // Compute Active Tier & Feature Flags
  const currentAppRecord = onboardingApplications.find((a) => a.applicant_id === currentUser.id);
  const activeTier: SubscriptionTier = currentUser.role === 'COACH'
    ? 'TIER_2_VIP'
    : currentAppRecord?.selected_tier || 'TIER_2_VIP';
  const activeOnboardingStatus: OnboardingStatus = currentUser.role === 'COACH'
    ? 'TIER_2_APPROVED'
    : currentAppRecord?.status || 'TIER_2_APPROVED';

  const isVipUnlocked =
    currentUser.role === 'COACH' ||
    (activeTier === 'TIER_2_VIP' && activeOnboardingStatus === 'TIER_2_APPROVED');

  const isEntryUnlocked = activeOnboardingStatus === 'TIER_1_ACTIVE' || isVipUnlocked;

  const featureFlags: TierFeatureFlags = {
    can_access_workout_logger: isEntryUnlocked,
    can_access_recipes_and_hand_portions: isEntryUnlocked,
    can_access_community_qa: isEntryUnlocked,
    can_access_toolbox_habits: isEntryUnlocked,
    can_access_1on1_macrocycle: isVipUnlocked,
    can_submit_7step_checkin: isVipUnlocked,
    can_upload_execution_videos: isVipUnlocked,
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
        garminSleepLogs,
        macrocycleWeeks,
        calendarEvents,
        workoutPrograms,
        weeklyCheckins,
        stripeData,
        gdprConsents,
        auditLogs,
        cookiePreferences,
        isCookieModalOpen,
        currentRoute,
        isPreMergeGateOpen,
        isThemeEditorOpen,
        setCurrentRoute,
        switchUserRole,
        setSelectedAthleteId,
        setIsPreMergeGateOpen,
        setIsThemeEditorOpen,
        setIsCookieModalOpen,
        loginWithGoogle,
        logout,
        updateTheme,
        updateLandingContent,
        updateCookiePreferences,
        addDailyLog,
        bulkImportDailyLogs,
        importGarminFitActivity,
        importGarminSleepActivity,
        updateMacrocycleWeek,
        addCalendarEvent,
        deleteCalendarEvent,
        submitWeeklyCheckin,
        reviewCheckin,
        saveWorkoutProgram,
        addExerciseToProgram,
        exerciseLibrary,
        addExerciseToLibrary,
        updateExerciseInLibrary,
        deleteExerciseFromLibrary,
        acceptGdprConsent,
        eraseAllAthleteData,
        exportAthleteData,
        addAuditLog,
        schedulerConfig,
        emailDispatchLogs,
        isEmailSchedulerModalOpen,
        setIsEmailSchedulerModalOpen,
        updateSchedulerConfig,
        triggerCheckInEmailDispatch,
        workoutSessions,
        morningDomsLogs,
        isMorningDomsModalOpen,
        setIsMorningDomsModalOpen,
        logWorkoutSession,
        submitMorningDoms,
        gamificationRecords,
        latestCelebrationRecord,
        dismissCelebrationRecord,
        stepStreak,
        dripModules,
        completeDripModule,
        isEndOfDayModalOpen,
        setIsEndOfDayModalOpen,
        isMorningBriefingOpen,
        setIsMorningBriefingOpen,
        isDripModalOpen,
        setIsDripModalOpen,
        qaThreads,
        createQaThread,
        replyToQaThread,
        togglePinQaThread,
        hungerTargets,
        updateHungerTarget,
        satietyLogs,
        logPreMealHunger,
        logPostMealSatiety,
        habits,
        habitLogs,
        addHabitItem,
        toggleHabitCompletion,
        saveEveningReflection,
        onboardingApplications,
        activeTier,
        activeOnboardingStatus,
        featureFlags,
        isOnboardingModalOpen,
        setIsOnboardingModalOpen,
        submitOnboardingApplication,
        inviteToDiscoveryCall,
        approveVipApplication,
        locale,
        setLocale,
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
