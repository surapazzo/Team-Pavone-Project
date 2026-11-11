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

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE garmin_fit_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE macrocycle_phases ENABLE ROW LEVEL SECURITY;

-- Coach has full access to all athlete records
-- Athlete can only read/update their own records
