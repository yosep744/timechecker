export interface TimeEntry {
  id: string
  category: string
  startTime: number
  endTime?: number
  duration: number
  userId: string
}

export interface User {
  id: string
  name: string
  role: 'teacher' | 'staff' | 'admin'
  createdAt: number
}

export interface WeeklySummary {
  [category: string]: number
}

export interface TeamStats {
  userId: string
  userName: string
  totalHours: number
  categorySummary: WeeklySummary
  entryCount: number
}

export const CATEGORIES = [
  { id: 'teaching', label: '수업/강의', color: '#3b82f6' },
  { id: 'counseling', label: '학생 상담', color: '#10b981' },
  { id: 'admin', label: '행정 업무', color: '#f59e0b' },
  { id: 'preparation', label: '자료 준비', color: '#8b5cf6' },
  { id: 'meeting', label: '회의', color: '#ec4899' },
  { id: 'other', label: '기타', color: '#6b7280' }
]

export const ROLE_LABELS = {
  teacher: '강사',
  staff: '운영팀',
  admin: '관리자'
}
