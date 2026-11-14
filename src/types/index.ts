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

export interface LandingNavLink {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}

export interface LandingHeroMetric {
  id: string;
  value: string;
  label: string;
}

export type LandingPillarIconName =
  | 'FileSpreadsheet'
  | 'Dumbbell'
  | 'CheckCircle2'
  | 'ShieldCheck'
  | 'Clock'
  | 'Flame'
  | 'Target'
  | 'HeartPulse'
  | 'Sparkles'
  | 'Award'
  | 'Calendar'
  | 'Utensils';

export type LandingPillarAccent = 'purple' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate';

export interface LandingPillarCard {
  id: string;
  title: string;
  description: string;
  footer_note: string;
  media_type: 'ICON' | 'IMAGE';
  icon_name: LandingPillarIconName;
  image_url?: string;
  accent_color: LandingPillarAccent;
}

export interface LandingContent {
  // 1. Navbar & Brand Controls
  nav_links: LandingNavLink[];
  nav_onboarding_label: string;
  nav_login_label: string;
  nav_app_label: string;
  nav_public_site_label: string;

  // 2. Hero Section
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_primary_cta_text: string;
  hero_cta_text: string;
  hero_image_url?: string;
  hero_image_caption_kicker: string;
  hero_image_caption_title: string;
  hero_metrics: LandingHeroMetric[];

  // 3. Method / Operational Pillars Section
  method_visible: boolean;
  method_kicker: string;
  method_title: string;
  method_subtitle: string;
  method_cards: LandingPillarCard[];

  // 4. Coach & Staff Team Section
  coach_role_label: string;
  coach_method_tag: string;
  coach_name: string;
  coach_bio: string;
  coach_portrait_url?: string;
  staff_visible: boolean;
  staff_role_label: string;
  staff_name: string;
  staff_subtitle: string;
  staff_bio: string;
  staff_portrait_url?: string;

  // 5. Announcements Section
  announcements_visible: boolean;
  announcements_kicker: string;
  announcements_title: string;
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    date: string;
    published: boolean;
  }>;

  // 6. Testimonials / Transformations Section
  testimonials_visible: boolean;
  testimonials_kicker: string;
  testimonials_title: string;
  testimonials_subtitle: string;
  testimonials_badge_label: string;
  testimonials: Array<{
    id: string;
    athlete_name: string;
    text: string;
    before_after_url?: string;
    change_metric?: string;
  }>;

  // 7. Contact / Application Form & Footer
  contact_visible: boolean;
  contact_kicker: string;
  contact_title: string;
  contact_subtitle: string;
  contact_submit_text: string;
  contact_success_title: string;
  contact_success_body: string;
  contact_reset_button_text: string;
  footer_copyright_note: string;
  footer_cookie_label: string;
  footer_privacy_label: string;
  footer_login_label: string;
  footer_portal_label: string;
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

export type MuscleGroup =
  | 'PETTORALI'
  | 'DORSALI'
  | 'SPALLE'
  | 'QUADRICIPITI'
  | 'FEMORALI_GLUTEI'
  | 'BICIPITI'
  | 'TRICIPITI'
  | 'CORE_ADDOME'
  | 'POLPACCI';

export type EquipmentType =
  | 'BILANCIERE'
  | 'MANUBRI'
  | 'CAVI'
  | 'MACCHINARIO'
  | 'CORPO_LIBERO';

export type JointType = 'MULTI_JOINT' | 'SINGLE_JOINT';
export type ResistanceProfileBias = 'LENGTHENED' | 'MID_RANGE' | 'SHORTENED';

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  primary_muscle: MuscleGroup;
  secondary_muscle?: MuscleGroup;
  joint_type: JointType;
  resistance_profile_bias: ResistanceProfileBias;
  equipment: EquipmentType;
  description: string;
  key_points: string[];
  video_url: string; // YouTube embed or custom URL
  youtube_video_id?: string;
  default_sets: number;
  default_reps: string;
  default_rir: number;
  default_rest_sec: number;
  created_by?: string;
  updated_at?: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscle_group?: MuscleGroup;
  primary_muscle?: MuscleGroup;
  secondary_muscle?: MuscleGroup;
  joint_type?: JointType;
  resistance_profile_bias?: ResistanceProfileBias;
  youtube_video_id?: string;
  sets: number;
  reps: string;
  rir: number; // Reps In Reserve
  rest_sec: number;
  notes?: string;
  video_url?: string;
  library_exercise_id?: string;
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

// ============================================================================
// MODULE 1: MOBILE WORKOUT LOGGER, DOMS & TRAINING ANALYTICS
// ============================================================================
export interface WorkoutSetLog {
  id: string;
  exercise_id: string;
  exercise_name: string;
  primary_muscle: MuscleGroup;
  secondary_muscle?: MuscleGroup;
  joint_type: JointType;
  resistance_profile_bias: ResistanceProfileBias;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe_rir: number; // 0-10 (RIR or RPE)
  completed: boolean;
}

export interface WorkoutSessionLog {
  id: string;
  athlete_id: string;
  program_id: string;
  split_day: string;
  session_date: string; // YYYY-MM-DD
  started_at: string;
  ended_at: string;
  session_duration_minutes: number;
  pre_workout_effort: number; // 1-10
  intra_workout_effort: number; // 1-10
  post_workout_effort: number; // 1-10
  total_tonnage_kg: number;
  sets: WorkoutSetLog[];
  notes?: string;
}

export interface DomsMuscleScore {
  muscle: MuscleGroup;
  soreness: number; // 1-10
}

export interface MorningDomsLog {
  id: string;
  athlete_id: string;
  workout_session_id?: string;
  log_date: string; // YYYY-MM-DD
  has_soreness: boolean;
  muscle_scores: DomsMuscleScore[];
  created_at: string;
}

// ============================================================================
// MODULE 2: GAMIFICATION, STREAKS & EDUCATIONAL DRIP COURSES
// ============================================================================
export type RecordScope = 'EXERCISE' | 'SESSION' | 'WEEK' | 'YEAR';
export type RecordType = 'MAX_WEIGHT' | 'EST_1RM' | 'VOLUME';

export interface GamificationRecord {
  id: string;
  athlete_id: string;
  record_type: RecordType;
  scope: RecordScope;
  exercise_name?: string;
  value: number;
  unit: string;
  achieved_at: string;
  celebrated: boolean;
}

export interface StepStreakState {
  athlete_id: string;
  current_streak_days: number;
  best_streak_days: number;
  daily_target_steps: number;
  today_steps: number;
  last_celebrated_streak: number;
}

export interface EducationalDripModule {
  id: string;
  day_offset: number;
  category: 'FAT_LOSS' | 'MEAL_PREP' | 'WARM_UP' | 'SLEEP' | 'HORMONES';
  title_it: string;
  title_en: string;
  summary_it: string;
  summary_en: string;
  youtube_video_id?: string;
  duration_min: number;
  completed_by_athlete_ids: string[];
}

// ============================================================================
// MODULE 3: PUBLIC Q&A BOARD / COMMUNITY FAQ
// ============================================================================
export type QaTopic = 'Training' | 'Nutrition' | 'Habits' | 'Recovery' | 'Logistics';

export interface QaReply {
  id: string;
  thread_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  body: string;
  is_official_coach_reply: boolean;
  created_at: string;
}

export interface QaThread {
  id: string;
  author_id: string;
  author_name: string;
  topic: QaTopic;
  title: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
  replies: QaReply[];
}

// ============================================================================
// MODULE 4 & 5: NUTRITION HAND-PORTIONS, FOOD SPECTRUM, SATIETY & RECIPES
// ============================================================================
export interface HandPortionEquivalents {
  palms_protein: number;
  thumbs_fats: number;
  cupped_hands_carbs: number;
  fists_veggies: number;
}

export type FoodSpectrumTier = 'GREEN_EAT_MORE' | 'YELLOW_EAT_SOME' | 'RED_EAT_LESS';
export type FoodMacroCategory = 'PROTEIN' | 'CARBS' | 'FATS' | 'VEGGIES';

export interface FoodSpectrumItem {
  id: string;
  category: FoodMacroCategory;
  tier: FoodSpectrumTier;
  name_it: string;
  name_en: string;
  portion_hint_it: string;
  portion_hint_en: string;
}

export interface HungerSatietyTarget {
  meal_type: 'MAIN_MEAL' | 'SNACK';
  target_pre_hunger: number; // e.g., 8/10 main, 7/10 snack
  target_post_satiety: number; // e.g., 7/10 main, 7/10 snack
}

export interface MealSatietyLog {
  id: string;
  athlete_id: string;
  meal_label: string;
  meal_type: 'MAIN_MEAL' | 'SNACK';
  pre_meal_hunger: number; // 1-10
  post_meal_satiety?: number; // 1-10
  logged_at: string;
  satiety_prompt_due_at: string;
  satiety_completed_at?: string;
}

export type RecipeMealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type RecipeTag =
  | 'NO_COOK'
  | 'HEALTHY_SNACKS'
  | 'HIGH_PROTEIN'
  | 'MEDITERRANEAN'
  | 'VEGAN'
  | 'VEGETARIAN';

export interface RecipeItem {
  id: string;
  title_it: string;
  title_en: string;
  meal_type: RecipeMealType;
  tags: RecipeTag[];
  prep_minutes: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  hand_portions: HandPortionEquivalents;
  ingredients_it: string[];
  ingredients_en: string[];
  steps_it: string;
  steps_en: string;
  storage_tip_it: string;
  storage_tip_en: string;
  author_id?: string;
  author_name?: string;
  author_role?: UserRole;
  is_official?: boolean;
  image_url?: string;
  updated_at?: string;
}

// ============================================================================
// MODULE 6: HABIT TRACKER & PERSONAL TOOLBOX HUB
// ============================================================================
export interface HabitItem {
  id: string;
  athlete_id: string;
  title_it: string;
  title_en: string;
  weekly_target_days: number;
  category: 'MOVEMENT' | 'HYDRATION' | 'SLEEP' | 'NUTRITION' | 'MINDSET';
}

export interface HabitDailyLog {
  id: string;
  athlete_id: string;
  log_date: string; // YYYY-MM-DD
  completed_habit_ids: string[];
  evening_energy_score?: number; // 1-10
  evening_challenge_note?: string;
}

export interface ToolboxResource {
  id: string;
  code: string;
  title_it: string;
  title_en: string;
  subtitle_it: string;
  subtitle_en: string;
  type: 'CHALLENGE' | 'GUIDE' | 'WORKSHEET' | 'AUDIO';
  bullets_it: string[];
  bullets_en: string[];
  interactive_questions?: Array<{
    id: string;
    label_it: string;
    label_en: string;
  }>;
  audio_script_it?: string;
  audio_script_en?: string;
}

// ============================================================================
// MODULE 7: QUALIFYING ONBOARDING FUNNEL & 2-TIER FEATURE FLAGS
// ============================================================================
export type SubscriptionTier = 'TIER_1_ENTRY' | 'TIER_2_VIP';
export type OnboardingStatus =
  | 'NOT_STARTED'
  | 'TIER_1_ACTIVE'
  | 'PENDING_COACH_REVIEW'
  | 'DISCOVERY_CALL_INVITED'
  | 'TIER_2_APPROVED';

export interface TierFeatureFlags {
  can_access_workout_logger: boolean;
  can_access_recipes_and_hand_portions: boolean;
  can_access_community_qa: boolean;
  can_access_toolbox_habits: boolean;
  can_access_1on1_macrocycle: boolean;
  can_submit_7step_checkin: boolean;
  can_upload_execution_videos: boolean;
}

export interface OnboardingApplication {
  id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  selected_tier: SubscriptionTier;
  status: OnboardingStatus;
  primary_goal: string;
  training_experience: string;
  weekly_availability_days: number;
  injuries_or_notes: string;
  commitment_score: number; // 1-10
  stripe_checkout_completed: boolean;
  discovery_call_link?: string;
  submitted_at: string;
  updated_at: string;
}

// ============================================================================
// MODULE 8: MULTI-LANGUAGE (i18n)
// ============================================================================
export type SupportedLocale = 'it' | 'en' | 'es' | 'de' | 'fr';


