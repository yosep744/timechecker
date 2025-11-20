# ⏱️ 학원 업무 시간 추적기

학원(교육기관)에서 업무 효율을 높이기 위한 시간 관리 도구입니다.

## 🎯 주요 기능

### 👥 사용자 관리 시스템
- **3가지 역할**: 강사, 운영팀, 관리자(원장/부원장)
- **개인별 데이터 관리**: 각 사용자의 시간 기록을 개별 관리
- **간편한 로그인**: 사용자 선택만으로 빠른 접속
- **사용자 추가**: 관리자가 새로운 팀원 등록 가능

### 📊 개인 대시보드
- ⏰ **실시간 타이머**: 각 업무를 시작하고 종료하며 정확한 시간 추적
- 📈 **카테고리별 분류**: 6가지 업무 카테고리로 체계적인 시간 관리
  - 수업/강의
  - 학생 상담
  - 행정 업무
  - 자료 준비
  - 회의
  - 기타
- 📝 **업무 메모**: 각 활동마다 상세 내용 기록 가능 (AI 분석 준비)
- 📊 **주간 통계**: 지난 7일간의 업무 시간을 카테고리별로 요약
- 📝 **최근 활동 내역**: 최근 10개 활동 기록 및 메모 확인

### 🏢 관리자 대시보드
- 📈 **전체 통계**: 학원 전체 업무 시간 한눈에 확인
- 👥 **팀별 분석**: 강사팀/운영팀 별도 통계
- 🏆 **팀원 랭킹**: 업무 시간 기준 팀원별 순위
- 📊 **카테고리별 분석**: 전체 학원의 카테고리별 업무 분포
- 🔍 **개별 팀원 상세**: 각 팀원의 주요 업무와 활동량 확인

### 💾 데이터 관리
- **하이브리드 저장**: Supabase (클라우드) 또는 localStorage (로컬)
- **개인별 저장**: 각 사용자의 데이터 독립 관리
- **데이터 초기화**: 개인별 또는 전체 데이터 삭제 가능
- **AI 분석 준비**: 업무 메모를 통한 패턴 분석 가능

### 🎨 사용자 경험
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원
- 🎨 **직관적인 UI**: 깔끔하고 사용하기 쉬운 인터페이스
- 🌈 **색상 코딩**: 역할별, 카테고리별 색상 구분

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 시작되면 브라우저에서 `http://localhost:5173`로 접속하세요.

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 프리뷰

```bash
npm run preview
```

## 📦 사용 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 빌드 도구
- **CSS3** - 모던 스타일링
- **Supabase** - PostgreSQL 기반 클라우드 데이터베이스 (선택사항)

## 🎮 사용 방법

### 첫 시작 (관리자)

1. **기본 관리자 로그인**: 처음 실행하면 '관리자' 계정이 자동 생성됩니다
2. **팀원 추가**: 로그인 화면에서 "+ 새 사용자 추가" 버튼 클릭
3. **역할 지정**: 이름 입력 후 강사/운영팀/관리자 중 선택하여 팀원 등록

### 개인 사용자 (강사/운영팀)

1. **로그인**: 자신의 이름을 선택하여 로그인
2. **카테고리 선택**: 시작하고 싶은 업무 카테고리 선택
3. **타이머 시작**: "시작하기" 버튼 클릭
4. **업무 진행**: 타이머가 실행되는 동안 업무 진행
5. **타이머 종료**: "정지하기" 버튼 클릭
6. **통계 확인**: 본인의 이번 주 활동 요약 확인

### 관리자 사용

1. **개인 기록**: 일반 사용자처럼 본인의 업무 시간도 기록 가능
2. **관리자 대시보드**: 우측 상단 "관리자 대시보드" 버튼 클릭
3. **전체 현황 확인**:
   - 학원 전체 업무 시간
   - 강사팀/운영팀 별도 통계
   - 팀원별 업무 시간 랭킹
   - 카테고리별 전체 분석
4. **개인 뷰 전환**: "내 기록 보기" 버튼으로 개인 대시보드로 전환

## 📊 데이터 관리

기본적으로 **localStorage**를 사용하지만, **Supabase**를 설정하면 클라우드 데이터베이스로 자동 전환됩니다.

### 로컬 모드 (기본)
- 브라우저 localStorage 사용
- 별도 설정 없이 즉시 사용 가능
- 브라우저별 데이터 독립

### 클라우드 모드 (Supabase)
- 여러 기기에서 데이터 동기화
- 실시간 협업 가능
- AI 분석 및 고급 쿼리 지원

## 🚀 Supabase 설정 (선택사항)

Supabase를 사용하면 클라우드 데이터베이스로 업그레이드할 수 있습니다!

### 1단계: Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 및 회원가입
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호 설정
4. 리전 선택 (Northeast Asia - Seoul 추천)

### 2단계: 데이터베이스 스키마 실행

1. Supabase 대시보드 → SQL Editor 이동
2. `supabase-schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 실행 (Run)

### 3단계: 환경 변수 설정

1. `.env.example` 파일을 복사하여 `.env` 파일 생성:
   ```bash
   cp .env.example .env
   ```

2. Supabase 대시보드 → Settings → API에서 정보 확인:
   - Project URL
   - anon/public key

3. `.env` 파일에 입력:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

### 4단계: 확인

로딩 화면에 "🚀 Supabase 연결됨" 메시지가 표시되면 성공!

### AI 분석 예시 (Supabase SQL)

```sql
-- 강사별 가장 많이 가르치는 과목 분석
SELECT
  u.name,
  te.notes,
  COUNT(*) as frequency,
  SUM(te.duration) / 3600.0 as total_hours
FROM time_entries te
JOIN users u ON te.user_id = u.id
WHERE te.category = 'teaching'
  AND te.notes IS NOT NULL
GROUP BY u.name, te.notes
ORDER BY frequency DESC
LIMIT 10;

-- 업무 패턴 분석
SELECT
  EXTRACT(HOUR FROM start_time) as hour_of_day,
  category,
  COUNT(*) as activity_count,
  AVG(duration) / 60 as avg_minutes
FROM time_entries
WHERE start_time >= NOW() - INTERVAL '30 days'
GROUP BY hour_of_day, category
ORDER BY hour_of_day, activity_count DESC;

-- 메모 검색 (한글 지원)
SELECT * FROM search_notes('수학 일차방정식');
```

## 🌐 배포

### Lovable에 배포하기

1. [Lovable](https://lovable.dev)에 로그인합니다
2. "New Project" 클릭
3. 이 GitHub 저장소를 연결하거나 코드를 업로드합니다
4. 자동으로 빌드 및 배포가 진행됩니다

### 기타 플랫폼

- **Vercel**: GitHub 저장소를 연결하여 자동 배포
- **Netlify**: `dist` 폴더를 드래그 앤 드롭으로 배포
- **GitHub Pages**: GitHub Actions를 통한 자동 배포 가능

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 💡 기여

버그 리포트, 기능 제안, Pull Request를 환영합니다!

---

Made with ❤️ for improving academy efficiency
