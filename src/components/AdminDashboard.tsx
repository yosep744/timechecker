import type { User, TimeEntry, TeamStats } from '../types'
import { CATEGORIES, ROLE_LABELS } from '../types'
import './AdminDashboard.css'

interface AdminDashboardProps {
  currentUser: User
  allUsers: User[]
  allEntries: TimeEntry[]
  onLogout: () => void
  onViewPersonal: () => void
}

export default function AdminDashboard({
  currentUser,
  allUsers,
  allEntries,
  onLogout,
  onViewPersonal
}: AdminDashboardProps) {
  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1)
  }

  const getWeeklySummary = (userId: string) => {
    const now = Date.now()
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

    const summary: { [key: string]: number } = {}
    CATEGORIES.forEach(cat => {
      summary[cat.id] = 0
    })

    allEntries
      .filter(entry => entry.userId === userId && entry.startTime >= oneWeekAgo)
      .forEach(entry => {
        summary[entry.category] = (summary[entry.category] || 0) + entry.duration
      })

    return summary
  }

  const getUserStats = (userId: string): TeamStats => {
    const user = allUsers.find(u => u.id === userId)
    const categorySummary = getWeeklySummary(userId)
    const totalHours = Object.values(categorySummary).reduce((sum, val) => sum + val, 0)
    const now = Date.now()
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
    const entryCount = allEntries.filter(
      e => e.userId === userId && e.startTime >= oneWeekAgo
    ).length

    return {
      userId,
      userName: user?.name || 'Unknown',
      totalHours,
      categorySummary,
      entryCount
    }
  }

  const teachers = allUsers.filter(u => u.role === 'teacher')
  const staff = allUsers.filter(u => u.role === 'staff')

  const teacherStats = teachers.map(u => getUserStats(u.id))
  const staffStats = staff.map(u => getUserStats(u.id))

  const totalTeacherHours = teacherStats.reduce((sum, stat) => sum + stat.totalHours, 0)
  const totalStaffHours = staffStats.reduce((sum, stat) => sum + stat.totalHours, 0)
  const totalHours = totalTeacherHours + totalStaffHours

  const allStats = [...teacherStats, ...staffStats].sort((a, b) => b.totalHours - a.totalHours)

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <div>
            <h1>📊 관리자 대시보드</h1>
            <p className="user-info">
              {currentUser.name} ({ROLE_LABELS[currentUser.role]})
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={onViewPersonal}>
              내 기록 보기
            </button>
            <button className="btn-logout" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {/* Overall Summary */}
        <div className="summary-cards">
          <div className="summary-card total">
            <div className="card-icon">🏢</div>
            <div className="card-content">
              <div className="card-label">전체 업무 시간</div>
              <div className="card-value">{formatHours(totalHours)}시간</div>
              <div className="card-detail">
                {allStats.reduce((sum, s) => sum + s.entryCount, 0)}개 활동
              </div>
            </div>
          </div>

          <div className="summary-card teacher">
            <div className="card-icon">👨‍🏫</div>
            <div className="card-content">
              <div className="card-label">강사팀</div>
              <div className="card-value">{formatHours(totalTeacherHours)}시간</div>
              <div className="card-detail">
                {teachers.length}명 / {teacherStats.reduce((sum, s) => sum + s.entryCount, 0)}개 활동
              </div>
            </div>
          </div>

          <div className="summary-card staff">
            <div className="card-icon">💼</div>
            <div className="card-content">
              <div className="card-label">운영팀</div>
              <div className="card-value">{formatHours(totalStaffHours)}시간</div>
              <div className="card-detail">
                {staff.length}명 / {staffStats.reduce((sum, s) => sum + s.entryCount, 0)}개 활동
              </div>
            </div>
          </div>
        </div>

        {/* Team Rankings */}
        <div className="rankings-section">
          <h2>👥 팀원별 업무 시간 (이번 주)</h2>
          <div className="rankings-list">
            {allStats.map((stat, index) => {
              const user = allUsers.find(u => u.id === stat.userId)
              const roleClass = user?.role || 'teacher'
              const topCategory = Object.entries(stat.categorySummary)
                .sort(([, a], [, b]) => b - a)[0]
              const topCategoryName = CATEGORIES.find(c => c.id === topCategory?.[0])?.label || '-'

              return (
                <div key={stat.userId} className={`ranking-item ${roleClass}`}>
                  <div className="rank-number">#{index + 1}</div>
                  <div className="user-info-detail">
                    <div className="user-name-role">
                      <span className="name">{stat.userName}</span>
                      <span className={`badge ${roleClass}`}>
                        {ROLE_LABELS[user?.role || 'teacher']}
                      </span>
                    </div>
                    <div className="stats-detail">
                      <span className="total-hours">{formatHours(stat.totalHours)}시간</span>
                      <span className="separator">•</span>
                      <span className="entry-count">{stat.entryCount}개 활동</span>
                      <span className="separator">•</span>
                      <span className="top-category">주요: {topCategoryName}</span>
                    </div>
                  </div>
                  <div className="hours-bar">
                    <div
                      className="hours-fill"
                      style={{
                        width: totalHours > 0 ? `${(stat.totalHours / totalHours) * 100}%` : '0%'
                      }}
                    />
                  </div>
                </div>
              )
            })}

            {allStats.length === 0 && (
              <div className="empty-state">
                <p>아직 기록된 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="category-section">
          <h2>📈 카테고리별 전체 통계</h2>
          <div className="category-stats">
            {CATEGORIES.map(category => {
              const totalSeconds = allStats.reduce(
                (sum, stat) => sum + (stat.categorySummary[category.id] || 0),
                0
              )
              const percentage = totalHours > 0 ? (totalSeconds / totalHours) * 100 : 0

              return (
                <div key={category.id} className="category-stat-item">
                  <div className="category-stat-header">
                    <span className="category-stat-name">{category.label}</span>
                    <span className="category-stat-hours">{formatHours(totalSeconds)}시간</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                  <div className="category-stat-percentage">{percentage.toFixed(1)}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
