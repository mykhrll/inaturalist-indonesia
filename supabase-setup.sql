-- ============================================
-- SUPABASE DATABASE SETUP - iNaturalist Indonesia
-- ============================================
-- Jalankan SQL ini di Supabase SQL Editor:
-- 1. Buka https://supabase.com/dashboard
-- 2. Pilih project Anda
-- 3. Klik "SQL Editor" di sidebar kiri
-- 4. Paste seluruh isi file ini
-- 5. Klik "Run"
-- ============================================

-- ===== TABEL 1: OBSERVATIONS (Hasil Identifikasi AI) =====
CREATE TABLE IF NOT EXISTS observations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    species_name TEXT NOT NULL DEFAULT '',
    scientific_name TEXT DEFAULT '',
    classification JSONB DEFAULT '{}',
    distribution_indonesia TEXT DEFAULT '',
    distribution_world TEXT DEFAULT '',
    habitat TEXT DEFAULT '',
    fun_fact TEXT DEFAULT '',
    ecological_role TEXT DEFAULT '',
    "references" JSONB DEFAULT '[]',
    related_species JSONB DEFAULT '[]',
    confidence TEXT DEFAULT '',
    image_base64 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TABEL 2: MONITORING (Lacak / Pemantauan Pertumbuhan) =====
CREATE TABLE IF NOT EXISTS monitoring (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plant_name TEXT NOT NULL,
    observation_date DATE NOT NULL,
    height_cm NUMERIC DEFAULT 0,
    leaf_count INTEGER DEFAULT 0,
    growth_phase TEXT DEFAULT 'Vegetatif',
    health_condition TEXT DEFAULT 'Sehat',
    notes TEXT DEFAULT '',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TABEL 3: QUIZ_SCORES (Skor Kuis Belajar) =====
CREATE TABLE IF NOT EXISTS quiz_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    quiz_type TEXT DEFAULT 'ekologi_tumbuhan',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ROW LEVEL SECURITY (RLS) =====
-- Aktifkan RLS di setiap tabel
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Users hanya bisa akses data milik mereka sendiri

-- Observations
CREATE POLICY "Users can view own observations" ON observations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own observations" ON observations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own observations" ON observations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own observations" ON observations
    FOR DELETE USING (auth.uid() = user_id);

-- Monitoring
CREATE POLICY "Users can view own monitoring" ON monitoring
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monitoring" ON monitoring
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitoring" ON monitoring
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitoring" ON monitoring
    FOR DELETE USING (auth.uid() = user_id);

-- Quiz Scores
CREATE POLICY "Users can view own quiz scores" ON quiz_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz scores" ON quiz_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== INDEXES untuk performa query =====
CREATE INDEX IF NOT EXISTS idx_observations_user_id ON observations(user_id);
CREATE INDEX IF NOT EXISTS idx_observations_created_at ON observations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_user_id ON monitoring(user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_date ON monitoring(observation_date);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_id ON quiz_scores(user_id);
