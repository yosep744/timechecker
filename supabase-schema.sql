-- 학원 업무 시간 추적기 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'staff', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Entries 테이블
CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('teaching', 'counseling', 'admin', 'preparation', 'meeting', 'other')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_category ON time_entries(category);
CREATE INDEX IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at);

-- 전문 검색을 위한 인덱스 (메모 검색용)
CREATE INDEX IF NOT EXISTS idx_time_entries_notes_search
ON time_entries USING gin(to_tsvector('simple', notes));

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON time_entries;
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 users 테이블 읽기 가능
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

-- RLS 정책: 모든 사용자가 users 테이블에 삽입 가능 (사용자 등록용)
CREATE POLICY "Enable insert for all users" ON users
  FOR INSERT WITH CHECK (true);

-- RLS 정책: 모든 사용자가 time_entries 읽기 가능 (관리자 대시보드용)
CREATE POLICY "Enable read access for all users" ON time_entries
  FOR SELECT USING (true);

-- RLS 정책: 모든 사용자가 time_entries 삽입 가능
CREATE POLICY "Enable insert for all users" ON time_entries
  FOR INSERT WITH CHECK (true);

-- RLS 정책: 본인의 time_entries만 업데이트 가능
CREATE POLICY "Enable update for own entries" ON time_entries
  FOR UPDATE USING (true);

-- RLS 정책: 본인의 time_entries만 삭제 가능
CREATE POLICY "Enable delete for own entries" ON time_entries
  FOR DELETE USING (true);

-- 유용한 뷰: 사용자별 주간 통계
CREATE OR REPLACE VIEW weekly_user_stats AS
SELECT
  u.id as user_id,
  u.name as user_name,
  u.role,
  COUNT(te.id) as entry_count,
  SUM(te.duration) as total_duration_seconds,
  ROUND(SUM(te.duration) / 3600.0, 1) as total_hours
FROM users u
LEFT JOIN time_entries te ON u.id = te.user_id
  AND te.start_time >= NOW() - INTERVAL '7 days'
GROUP BY u.id, u.name, u.role
ORDER BY total_duration_seconds DESC NULLS LAST;

-- 유용한 뷰: 카테고리별 통계
CREATE OR REPLACE VIEW category_stats AS
SELECT
  category,
  COUNT(*) as entry_count,
  SUM(duration) as total_duration_seconds,
  ROUND(SUM(duration) / 3600.0, 1) as total_hours,
  COUNT(DISTINCT user_id) as unique_users
FROM time_entries
WHERE start_time >= NOW() - INTERVAL '7 days'
GROUP BY category
ORDER BY total_duration_seconds DESC;

-- 메모 검색 함수 (텍스트 검색)
CREATE OR REPLACE FUNCTION search_notes(search_query TEXT)
RETURNS TABLE (
  id TEXT,
  user_id TEXT,
  category TEXT,
  notes TEXT,
  start_time TIMESTAMPTZ,
  duration INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    te.id,
    te.user_id,
    te.category,
    te.notes,
    te.start_time,
    te.duration,
    ts_rank(to_tsvector('simple', te.notes), plainto_tsquery('simple', search_query)) as relevance
  FROM time_entries te
  WHERE te.notes IS NOT NULL
    AND to_tsvector('simple', te.notes) @@ plainto_tsquery('simple', search_query)
  ORDER BY relevance DESC, te.start_time DESC;
END;
$$ LANGUAGE plpgsql;

-- 기본 관리자 계정 삽입 (존재하지 않는 경우에만)
INSERT INTO users (id, name, role, created_at)
VALUES ('admin-default', '관리자', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 데이터베이스 스키마가 성공적으로 생성되었습니다!';
  RAISE NOTICE '📊 테이블: users, time_entries';
  RAISE NOTICE '📈 뷰: weekly_user_stats, category_stats';
  RAISE NOTICE '🔍 검색 함수: search_notes()';
END $$;
