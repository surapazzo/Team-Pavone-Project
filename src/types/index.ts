/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'COACH' | 'COLLABORATOR' | 'ATHLETE';

export type NutritionPhaseType = 
  | 'DEFICIT' 
  | 'MAINTENANCE' 
  | 'SURPLUS' 
  | 'DIET_BREAK' 
  | 'REVERSE';

export type TrainingPhaseType = 
  | 'IPERTROFIA' 
  | 'FORZA' 
  | 'DELOAD' 
  | 'METABOLICO' 
  | 'GPP' 
  | 'TENSIONE' 
  | 'IPERTROFIA_SARCO' 
  | 'NEURO' 
  | 'AMPK' 
  | 'HYPERDENSE' 
  | 'CLUSTER' 
  | 'HP_DOWNSETS' 
  | 'HP_STRAIGHT_SS';

export type EventPriorityType = 'LOW' | 'HIGH';
export type ReviewStatusType = 'PENDING' | 'REVIEWED';
export type TrainingExperienceLevel = 'UNDER_2_YEARS' | 'TWO_TO_FOUR_YEARS' | 'OVER_4_YEARS';

export interface ThemeConfig {
  id: string;
  brand_name: string;
  logo_url?: string;
  bg_primary: string;
  bg_secondary: string;
  text_primary: string;
  accent_primary: string;
  accent_secondary: string;
  custom_css_vars?: Record<string, string>;
  updated_at: string;
}

export interface LandingContent {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  coach_bio: string;
  hero_image_url?: string;
  coach_portrait_url?: string;
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    date: string;
    published: boolean;
  }>;
  testimonials: Array<{
    id: string;
    athlete_name: string;
    text: string;
    before_after_url?: string;
    change_metric?: string;
  }>;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  assigned_coach_id?: string;
  theme_id?: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  initial_weight_kg: number;
  target_weight_kg: number;
  experience_level: TrainingExperienceLevel;
  created_at: string;
}

export interface DailyLog {
  id: string;
  athlete_id: string;
  log_date: string; // YYYY-MM-DD
  weight_kg: number;
  calories_kcal: number;
  steps: number;
  sleep_hours: number;
  workout_completed: boolean;
  waist_circ_cm?: number;
  hips_circ_cm?: number;
  arm_circ_cm?: number;
  thigh_circ_cm?: number;
  notes?: string;
}

export interface GarminFitActivity {
  id: string;
  athlete_id: string;
  activity_date: string;
  file_name: string;
  file_size_bytes: number;
  crc16_valid: boolean;
  activity_type: string;
  duration_seconds: number;
  active_calories: number;
  avg_heart_rate: number;
  max_heart_rate: number;
  total_steps: number;
  raw_fit_metadata?: Record<string, unknown>;
  imported_at: string;
}

export interface GarminSleepLog {
  id: string;
  athlete_id: string;
  sleep_date: string; // YYYY-MM-DD
  total_sleep_hours: number;
  sleep_score: number; // 0-100
  quality_rating: 'ECCELLENTE' | 'BUONO' | 'ACCETTABILE' | 'SCADENTE';
  deep_sleep_minutes: number;
  light_sleep_minutes: number;
  rem_sleep_minutes: number;
  awake_minutes: number;
  avg_hrv_ms: number;
  resting_heart_rate_bpm: number;
  sleep_efficiency_pct: number;
  file_name: string;
  imported_at: string;
}

export interface MacrocycleWeek {
  id: string;
  athlete_id: string;
  week_number: number;
  year: number;
  iso_week: string; // e.g. '2026-W10'
  training_phase: TrainingPhaseType;
  nutrition_phase: NutritionPhaseType;
  target_kcal_on: number;
  target_kcal_off: number;
  target_carbs_on_g: number;
  target_carbs_off_g: number;
  target_protein_g: number;
  target_fats_g: number;
  target_steps_daily: number;
  cardio_prescription: string;
}

export interface CalendarEvent {
  id: string;
  athlete_id: string;
  event_date: string;
  title: string;
  priority: EventPriorityType;
  notes?: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rir: number; // Reps In Reserve
  rest_sec: number;
  notes?: string;
  video_url?: string;
}

export interface WorkoutProgram {
  id: string;
  athlete_id: string;
  title: string;
  mesocycle_name: string;
  split_day: string; // e.g. 'Giorno A - Upper Push'
  exercises: ExerciseItem[];
  active: boolean;
}

export interface ExerciseVideo {
  id: string;
  exercise_name: string;
  tutorial_url: string;
  key_points: string[];
}

export interface WeeklyCheckIn {
  id: string;
  athlete_id: string;
  iso_week: string;
  submission_date: string;
  review_status: ReviewStatusType;
  coach_feedback?: string;

  // 0. Auto-calcolati
  avg_weight_kg: number;
  avg_steps: number;
  avg_calories?: number;
  checkin_link?: string;

  // 1. Generale
  weekly_rating: number; // 1-10
  highlights: string;
  improvement_areas: string;
  photos_uploaded: Array<{
    view: 'front' | 'side' | 'back';
    url: string;
    caption?: string;
  }>;

  // 2. Allenamento
  training_energy: 'Alta' | 'Buona' | 'Bassa';
  training_time_slot: string; // Mattina / Pausa pranzo / Pomeriggio / Sera
  training_exact_time?: string;
  post_workout_fatigue: 'Si' | 'No' | 'Dipende';
  exercise_improvements: string;
  exercises_needing_work: string;
  mesocycle_favorite: string;
  execution_videos: Array<{
    exercise_name: string;
    video_url: string;
    coach_comment?: string;
  }>;
  training_motivation: string;
  training_questions: string;

  // 3. Nutrizione
  hit_macros_daily: 'Si' | 'No' | 'Dipende';
  measurement_precision: number; // 1-10
  daytime_hunger: string;
  meals_per_day: number;
  diet_struggles: string;

  // 4. Recupero
  day_energy: 'Alta' | 'Buona' | 'Bassa';
  muscle_joint_soreness: string;

  // 5. Sonno
  sleep_trouble: 'Si' | 'No' | 'Dipende';
  avg_bedtime: string;
  late_nights: string;
  night_wakings: string;

  // 6. Digestione
  digestive_issues: 'Si' | 'No';
  suspected_foods: string;

  // 7. Conclusione
  free_thoughts_space: string;
}

export interface GdprConsentRecord {
  id: string;
  athlete_id: string;
  art9_health_data_consent: boolean;
  consent_timestamp: string;
  data_export_requested_at?: string;
  erasure_requested_at?: string;
  ip_address: string;
}

export interface SecurityAuditLog {
  id: string;
  user_id?: string;
  event_type: string;
  severity: 'INFO' | 'WARN' | 'ALERT';
  ip_address: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface StripeSubscriptionData {
  mrr_eur: number;
  active_subscribers: number;
  expiring_this_week: number;
  subscriptions: Array<{
    id: string;
    athlete_name: string;
    plan: string;
    status: 'ACTIVE' | 'TRIALING' | 'EXPIRING' | 'PAST_DUE';
    renewal_date: string;
    amount_eur: number;
  }>;
}

export interface TestCaseResult {
  id: string;
  category: string;
  title: string;
  procedure: string;
  pass_criterion: string;
  status: 'IDLE' | 'RUNNING' | 'PASSED' | 'FAILED';
  execution_log?: string;
  timestamp?: string;
}

export interface CookiePreferences {
  necessary: boolean; // Sempre attivi per sessione, token e sicurezza
  preferences: boolean; // Impostazioni interfaccia, lingua, tema
  analytics: boolean; // Statistiche anonime e telemetria prestazionale
  timestamp: string;
  hasConsented: boolean;
}

// ============================================================================
// CHECK-IN EMAIL SCHEDULER & DISPATCH LOG TYPES
// ============================================================================
export type CheckInSchedulerTriggerType = 'WEEKLY_REMINDER' | 'CHECKIN_REPORT_SUBMISSION' | 'MANUAL_DISPATCH';
export type CheckInEmailStatus = 'SCHEDULED' | 'SENT' | 'FAILED' | 'PENDING';
export type CheckInDayOfWeek = 'SUNDAY' | 'MONDAY' | 'SATURDAY' | 'FRIDAY';

export interface CheckInSchedulerConfig {
  id: string;
  athlete_id: string; // 'ALL' or specific athlete ID
  enabled: boolean;
  day_of_week: CheckInDayOfWeek;
  send_time: string; // '18:00'
  timezone: string; // 'Europe/Rome'
  send_reminder_to_athlete: boolean;
  send_report_to_coach: boolean;
  send_report_to_athlete_copy: boolean;
  coach_email: string; // 'francesco.pavone@teampavone.it'
  additional_cc_emails: string[]; // e.g. ['daniele.coach@teampavone.it']
  template_type: 'TEAM_PAVONE_OFFICIAL' | 'EXECUTIVE_COACH' | 'ATHLETE_SUMMARY';
  include_garmin_sleep_data: boolean;
  include_progress_photos: boolean;
  last_run_timestamp?: string;
  next_scheduled_run: string;
  auto_retry_on_failure: boolean;
}

export interface CheckInEmailDispatchLog {
  id: string;
  scheduler_id?: string;
  checkin_id?: string;
  athlete_id: string;
  athlete_name: string;
  recipient_email: string;
  cc_emails?: string[];
  subject: string;
  status: CheckInEmailStatus;
  sent_at: string;
  delivery_time_ms: number; // e.g. 1420ms (< 5s as per TC-QA-02)
  email_html_preview: string;
  trigger_type: CheckInSchedulerTriggerType;
  error_message?: string;
}

