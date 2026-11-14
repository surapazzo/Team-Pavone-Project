-- ============================================================================
-- PROGETTO TEAM PAVONE - FULL DATABASE SCHEMA (PostgreSQL / Supabase)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS DI DOMINIO
CREATE TYPE user_role AS ENUM ('COACH', 'COLLABORATOR', 'ATHLETE');
CREATE TYPE nutrition_phase_type AS ENUM ('DEFICIT', 'MAINTENANCE', 'SURPLUS', 'DIET_BREAK', 'REVERSE');
CREATE TYPE training_phase_type AS ENUM (
  'IPERTROFIA', 'FORZA', 'DELOAD', 'METABOLICO', 'GPP', 'TENSIONE', 
  'IPERTROFIA_SARCO', 'NEURO', 'AMPK', 'HYPERDENSE', 'CLUSTER', 
  'HP_DOWNSETS', 'HP_STRAIGHT_SS'
);
CREATE TYPE event_priority_type AS ENUM ('LOW', 'HIGH');
CREATE TYPE review_status_type AS ENUM ('PENDING', 'REVIEWED');
CREATE TYPE training_experience_level AS ENUM ('UNDER_2_YEARS', 'TWO_TO_FOUR_YEARS', 'OVER_4_YEARS');

-- 2. WHITE-LABEL THEMES & LANDING PAGE CMS
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name VARCHAR(100) NOT NULL DEFAULT 'Team Pavone',
  logo_url TEXT,
  bg_primary VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
  bg_secondary VARCHAR(7) NOT NULL DEFAULT '#F8FAFC',
  text_primary VARCHAR(7) NOT NULL DEFAULT '#0F172A',
  accent_primary VARCHAR(7) NOT NULL DEFAULT '#6D28D9',
  accent_secondary VARCHAR(7) NOT NULL DEFAULT '#7C3AED',
  custom_css_vars JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE landing_page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  hero_title TEXT NOT NULL DEFAULT 'Team Pavone - Coaching & Bodybuilding',
  hero_subtitle TEXT NOT NULL DEFAULT 'Programmazione scientifica, check-in settimanali e risultati misurabili.',
  hero_cta_text VARCHAR(80) NOT NULL DEFAULT 'Accedi all''Area Riservata',
  coach_bio TEXT,
  announcements JSONB DEFAULT '[]'::jsonb, -- [{title, body, date, published}]
  testimonials JSONB DEFAULT '[]'::jsonb,  -- [{athlete_name, text, before_after_url, change}]
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROFILI UTENTE
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL DEFAULT 'ATHLETE',
  assigned_coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  avatar_url TEXT,
  initial_weight_kg NUMERIC(5,2),
  target_weight_kg NUMERIC(5,2),
  experience_level training_experience_level DEFAULT 'TWO_TO_FOUR_YEARS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LOG GIORNALIERI E SINCRONIZZAZIONE GARMIN .FIT
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  calories_kcal INT,
  steps INT,
  sleep_hours NUMERIC(3,1),
  workout_completed BOOLEAN NOT NULL DEFAULT FALSE,
  waist_circ_cm NUMERIC(4,1),
  hips_circ_cm NUMERIC(4,1),
  arm_circ_cm NUMERIC(4,1),
  thigh_circ_cm NUMERIC(4,1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_athlete_date UNIQUE (athlete_id, log_date)
);

CREATE TABLE garmin_fit_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes INT NOT NULL,
  crc16_valid BOOLEAN NOT NULL DEFAULT TRUE,
  activity_type VARCHAR(50) DEFAULT 'strength_training',
  duration_seconds INT NOT NULL,
  active_calories INT,
  avg_heart_rate INT,
  max_heart_rate INT,
  total_steps INT,
  raw_fit_metadata JSONB DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MACROCICLO, PERIODIZZAZIONE E NUTRIZIONE
CREATE TABLE macrocycle_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  year INT NOT NULL,
  iso_week VARCHAR(10) NOT NULL, -- e.g. '2026-W10'
  training_phase training_phase_type NOT NULL,
  nutrition_phase nutrition_phase_type NOT NULL,
  target_kcal_on INT NOT NULL,
  target_kcal_off INT NOT NULL,
  target_carbs_on_g INT NOT NULL,
  target_carbs_off_g INT NOT NULL,
  target_protein_g INT NOT NULL,
  target_fats_g INT NOT NULL,
  target_steps_daily INT NOT NULL DEFAULT 10000,
  cardio_prescription TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_athlete_iso_week UNIQUE (athlete_id, iso_week)
);

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  title VARCHAR(150) NOT NULL,
  priority event_priority_type NOT NULL DEFAULT 'LOW',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SCHEDE DI ALLENAMENTO E LIBRERIA VIDEO
CREATE TABLE workout_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  mesocycle_name VARCHAR(100) NOT NULL,
  split_day VARCHAR(50) NOT NULL, -- e.g. 'Giorno A - Upper Push'
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{name, sets, reps, rir, rest, notes, video_url}]
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exercise_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_name VARCHAR(150) NOT NULL,
  tutorial_url TEXT NOT NULL,
  key_points JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CHECK-IN SETTIMANALE IN 7 AREE
CREATE TABLE weekly_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  iso_week VARCHAR(10) NOT NULL,
  submission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_status review_status_type NOT NULL DEFAULT 'PENDING',
  coach_feedback TEXT,
  
  -- Area 0: Auto-calcolati
  avg_weight_kg NUMERIC(5,2),
  avg_steps INT,
  
  -- Area 1: Generale
  weekly_rating INT CHECK (weekly_rating BETWEEN 1 AND 10),
  highlights TEXT,
  improvement_areas TEXT,
  photos_uploaded JSONB DEFAULT '[]'::jsonb, -- [{view: 'front'|'side'|'back', url}]
  
  -- Area 2: Allenamento
  training_energy VARCHAR(20), -- 'Alta' | 'Buona' | 'Bassa'
  training_time_slot VARCHAR(50),
  post_workout_fatigue VARCHAR(20), -- 'Si' | 'No' | 'Dipende'
  exercise_improvements TEXT,
  exercises_needing_work TEXT,
  mesocycle_favorite TEXT,
  execution_videos JSONB DEFAULT '[]'::jsonb, -- [{exercise, video_url, coach_comment}]
  training_motivation TEXT,
  training_questions TEXT,
  
  -- Area 3: Nutrizione
  hit_macros_daily VARCHAR(20), -- 'Si' | 'No' | 'Dipende'
  measurement_precision INT CHECK (measurement_precision BETWEEN 1 AND 10),
  daytime_hunger TEXT,
  meals_per_day INT,
  diet_struggles TEXT,
  
  -- Area 4: Recupero
  day_energy VARCHAR(20),
  muscle_joint_soreness TEXT,
  
  -- Area 5: Sonno
  sleep_trouble VARCHAR(20),
  avg_bedtime VARCHAR(20),
  late_nights TEXT,
  night_wakings TEXT,
  
  -- Area 6: Digestione
  digestive_issues VARCHAR(20),
  suspected_foods TEXT,
  
  -- Area 7: Conclusione
  free_thoughts_space TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_checkin_athlete_week UNIQUE (athlete_id, iso_week)
);

-- 8. SICUREZZA, AUDIT LOG E CONSENSO GDPR ART. 9
CREATE TABLE gdpr_consents_and_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  art9_health_data_consent BOOLEAN NOT NULL DEFAULT FALSE,
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_export_requested_at TIMESTAMPTZ,
  erasure_requested_at TIMESTAMPTZ,
  ip_address VARCHAR(45)
);

CREATE TABLE security_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
  ip_address VARCHAR(45),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. VISTA AGGREGAZIONE SETTIMANALE ISO
CREATE OR REPLACE VIEW v_weekly_athlete_summary AS
SELECT 
  d.athlete_id,
  TO_CHAR(d.log_date, 'IYYY-"W"IW') AS iso_week,
  ROUND(AVG(d.weight_kg), 2) AS avg_weight_kg,
  ROUND(AVG(d.calories_kcal), 0) AS avg_calories_kcal,
  ROUND(AVG(d.steps), 0) AS avg_steps,
  COUNT(CASE WHEN d.workout_completed THEN 1 END) AS total_workouts,
  MIN(d.log_date) AS week_start_date,
  MAX(d.log_date) AS week_end_date
FROM daily_logs d
GROUP BY d.athlete_id, TO_CHAR(d.log_date, 'IYYY-"W"IW');

-- 10. ROW LEVEL SECURITY (RLS) POLICIES (BASE)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE macrocycle_phases ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 11. MODULE 1 UPGRADE: EXERCISE TAXONOMY, WORKOUT LOGGER & MORNING DOMS
-- ============================================================================
CREATE TYPE joint_type_enum AS ENUM ('MULTI_JOINT', 'SINGLE_JOINT');
CREATE TYPE resistance_profile_bias_enum AS ENUM ('LENGTHENED', 'MID_RANGE', 'SHORTENED');

CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  primary_muscle VARCHAR(60) NOT NULL,
  secondary_muscle VARCHAR(60),
  joint_type joint_type_enum NOT NULL DEFAULT 'MULTI_JOINT',
  resistance_profile_bias resistance_profile_bias_enum NOT NULL DEFAULT 'MID_RANGE',
  equipment VARCHAR(60) NOT NULL,
  description TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  youtube_video_id VARCHAR(32),
  tutorial_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES workout_programs(id) ON DELETE SET NULL,
  split_day VARCHAR(80) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  session_duration_minutes INT NOT NULL,
  effort_pre INT CHECK (effort_pre BETWEEN 1 AND 10),
  effort_intra INT CHECK (effort_intra BETWEEN 1 AND 10),
  effort_post INT CHECK (effort_post BETWEEN 1 AND 10),
  total_tonnage_kg NUMERIC(10,2) DEFAULT 0,
  total_working_sets INT DEFAULT 0,
  iso_week VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_set_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  exercise_name VARCHAR(150) NOT NULL,
  primary_muscle VARCHAR(60) NOT NULL,
  secondary_muscle VARCHAR(60),
  joint_type joint_type_enum NOT NULL DEFAULT 'MULTI_JOINT',
  resistance_profile_bias resistance_profile_bias_enum NOT NULL DEFAULT 'MID_RANGE',
  set_number INT NOT NULL,
  weight_kg NUMERIC(6,2) NOT NULL,
  reps INT NOT NULL,
  rpe_rir NUMERIC(3,1) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS morning_doms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  has_soreness BOOLEAN NOT NULL DEFAULT FALSE,
  muscle_soreness JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "PETTORALI": 7, "TRICIPITI": 5 }
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. MODULE 2 UPGRADE: GAMIFICATION RECORDS & DRIP TOUCHPOINTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS gamification_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  record_scope VARCHAR(30) NOT NULL, -- 'PR_1RM' | 'VOLUME_EXERCISE' | 'VOLUME_SESSION' | 'VOLUME_WEEK' | 'VOLUME_YEAR' | 'STEP_STREAK'
  exercise_name VARCHAR(150),
  metric_value NUMERIC(12,2) NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS educational_drip_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_slug VARCHAR(80) NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_athlete_drip UNIQUE (athlete_id, module_slug)
);

-- ============================================================================
-- 13. MODULE 3 UPGRADE: PUBLIC COMMUNITY Q&A / FAQ BOARD
-- ============================================================================
CREATE TYPE qa_topic_enum AS ENUM ('Training', 'Nutrition', 'Habits', 'Recovery', 'Logistics');

CREATE TABLE IF NOT EXISTS community_qa_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic qa_topic_enum NOT NULL DEFAULT 'Training',
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_answered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_qa_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES community_qa_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_official_coach_reply BOOLEAN NOT NULL DEFAULT FALSE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 14. MODULE 4 & 5 UPGRADE: NUTRITION SATIETY LOGS & RECIPE DATABASE
-- ============================================================================
CREATE TABLE IF NOT EXISTS nutrition_satiety_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('MAIN_MEAL', 'SNACK')),
  meal_label VARCHAR(100) NOT NULL,
  target_hunger INT NOT NULL DEFAULT 8,
  target_satiety INT NOT NULL DEFAULT 7,
  actual_pre_hunger INT CHECK (actual_pre_hunger BETWEEN 1 AND 10),
  actual_post_satiety INT CHECK (actual_post_satiety BETWEEN 1 AND 10),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  satiety_logged_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_official BOOLEAN NOT NULL DEFAULT TRUE,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  prep_time_min INT NOT NULL,
  calories_kcal INT NOT NULL,
  protein_g INT NOT NULL,
  carbs_g INT NOT NULL,
  fat_g INT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions TEXT NOT NULL,
  storage_tips TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 15. MODULE 6 UPGRADE: HABITS & PERSONAL TOOLBOX
-- ============================================================================
CREATE TABLE IF NOT EXISTS habit_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  weekly_target INT NOT NULL DEFAULT 7,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habit_assignments(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  evening_energy INT CHECK (evening_energy BETWEEN 1 AND 10),
  challenge_note TEXT,
  CONSTRAINT uq_habit_date UNIQUE (habit_id, log_date)
);

-- ============================================================================
-- 16. MODULE 7 UPGRADE: QUALIFYING ONBOARDING FUNNEL & 2-TIER ACCESS
-- ============================================================================
CREATE TYPE subscription_tier_enum AS ENUM ('ENTRY_APP', 'VIP_COACHING');
CREATE TYPE onboarding_status_enum AS ENUM (
  'QUESTIONNAIRE_DRAFT', 'ACTIVE_ENTRY_SUBSCRIPTION', 'PENDING_COACH_REVIEW', 'DISCOVERY_CALL_INVITED', 'APPROVED_VIP'
);

CREATE TABLE IF NOT EXISTS onboarding_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  applicant_name VARCHAR(150) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  requested_tier subscription_tier_enum NOT NULL,
  status onboarding_status_enum NOT NULL DEFAULT 'PENDING_COACH_REVIEW',
  questionnaire_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  discovery_call_link TEXT,
  coach_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================================================
-- 17. SUPABASE ROW LEVEL SECURITY (RLS) ON ALL HEALTH, NUTRITION & DOMS TABLES
-- ============================================================================
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_doms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_drip_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_qa_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_qa_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_satiety_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_applications ENABLE ROW LEVEL SECURITY;

-- Policy helper: Coach has full access; Athletes can only read/write their own health records
CREATE POLICY "athlete_own_workout_sessions" ON workout_sessions
  FOR ALL USING (auth.uid() = athlete_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'COACH'));

CREATE POLICY "athlete_own_workout_set_logs" ON workout_set_logs
  FOR ALL USING (auth.uid() = athlete_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'COACH'));

CREATE POLICY "athlete_own_morning_doms_logs" ON morning_doms_logs
  FOR ALL USING (auth.uid() = athlete_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'COACH'));

CREATE POLICY "athlete_own_satiety_logs" ON nutrition_satiety_logs
  FOR ALL USING (auth.uid() = athlete_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'COACH'));

CREATE POLICY "athlete_own_habit_logs" ON habit_daily_logs
  FOR ALL USING (auth.uid() = athlete_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'COACH'));

CREATE POLICY "athlete_own_onboarding" ON onboarding_applications
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'COACH'));

CREATE POLICY "public_read_community_qa" ON community_qa_threads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "author_manage_community_qa" ON community_qa_threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

