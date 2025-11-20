import { useState, useEffect } from 'react'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import NoteModal from './components/NoteModal'
import type { User, TimeEntry } from './types'
import { CATEGORIES } from './types'
import { fetchUsers, createUser, fetchTimeEntries, createTimeEntry } from './lib/api'
import { isSupabaseConfigured } from './lib/supabase'
import './App.css'

type ViewMode = 'personal' | 'admin'

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [allEntries, setAllEntries] = useState<TimeEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [viewMode, setViewMode] = useState<ViewMode>('personal')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [pendingEntry, setPendingEntry] = useState<TimeEntry | null>(null)
  const [loading, setLoading] = useState(true)

  // Load data from Supabase or localStorage
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Load users
      let loadedUsers = await fetchUsers()
      if (loadedUsers.length === 0) {
        // Create default admin user
        const defaultAdmin: User = {
          id: 'admin-default',
          name: '관리자',
          role: 'admin',
          createdAt: Date.now()
        }
        await createUser(defaultAdmin)
        loadedUsers = [defaultAdmin]
      }
      setUsers(loadedUsers)

      // Load time entries
      const loadedEntries = await fetchTimeEntries()
      setAllEntries(loadedEntries)
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update current time every second for timer display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setViewMode(user.role === 'admin' ? 'admin' : 'personal')
  }

  const handleAddUser = async (name: string, role: 'teacher' | 'staff' | 'admin') => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      role,
      createdAt: Date.now()
    }

    const created = await createUser(newUser)
    if (created) {
      setUsers([...users, created])
    }
  }

  const handleLogout = () => {
    if (currentEntry) {
      // Stop current timer before logout
      stopTimer()
    }
    setCurrentUser(null)
    setViewMode('personal')
  }

  const startTimer = () => {
    if (!currentUser) return

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      category: selectedCategory,
      startTime: Date.now(),
      duration: 0,
      userId: currentUser.id
    }
    setCurrentEntry(newEntry)
  }

  const stopTimer = () => {
    if (!currentEntry) return

    const endTime = Date.now()
    const duration = Math.floor((endTime - currentEntry.startTime) / 1000)

    const completedEntry: TimeEntry = {
      ...currentEntry,
      endTime,
      duration
    }

    // Show note modal
    setPendingEntry(completedEntry)
    setShowNoteModal(true)
    setCurrentEntry(null)
  }

  const handleSaveNote = async (notes: string) => {
    if (!pendingEntry) return

    const entryWithNotes: TimeEntry = {
      ...pendingEntry,
      notes
    }

    const created = await createTimeEntry(entryWithNotes)
    if (created) {
      setAllEntries([created, ...allEntries])
    }

    setShowNoteModal(false)
    setPendingEntry(null)
  }

  const handleSkipNote = async () => {
    if (!pendingEntry) return

    const created = await createTimeEntry(pendingEntry)
    if (created) {
      setAllEntries([created, ...allEntries])
    }

    setShowNoteModal(false)
    setPendingEntry(null)
  }

  // Reserved for future use: edit notes after creation
  // const handleUpdateNote = async (entryId: string, notes: string) => {
  //   const updated = await updateTimeEntry(entryId, { notes })
  //   if (updated) {
  //     setAllEntries(allEntries.map(e => e.id === entryId ? updated : e))
  //   }
  // }

  const getCurrentDuration = () => {
    if (!currentEntry) return 0
    return Math.floor((currentTime - currentEntry.startTime) / 1000)
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

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

  const getTotalWeeklyHours = (userId: string) => {
    const summary = getWeeklySummary(userId)
    return Object.values(summary).reduce((total, seconds) => total + seconds, 0)
  }

  const clearAllData = () => {
    if (window.confirm('모든 데이터를 삭제하시겠습니까?')) {
      setAllEntries([])
      setCurrentEntry(null)
      localStorage.removeItem('allTimeEntries')
    }
  }

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="loader"></div>
          <p>데이터를 불러오는 중...</p>
          {isSupabaseConfigured ? (
            <p className="db-status">🚀 Supabase 연결됨</p>
          ) : (
            <p className="db-status">💾 로컬 모드</p>
          )}
        </div>
      </div>
    )
  }

  // If not logged in, show login screen
  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} onAddUser={handleAddUser} />
  }

  // If admin and in admin mode, show admin dashboard
  if (currentUser.role === 'admin' && viewMode === 'admin') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        allUsers={users}
        allEntries={allEntries}
        onLogout={handleLogout}
        onViewPersonal={() => setViewMode('personal')}
      />
    )
  }

  // Show personal dashboard
  const userEntries = allEntries.filter(e => e.userId === currentUser.id)
  const weeklySummary = getWeeklySummary(currentUser.id)
  const totalWeeklySeconds = getTotalWeeklyHours(currentUser.id)

  return (
    <>
      <div className="app">
        <header className="header">
          <div className="header-main">
            <div>
              <h1>⏱️ 학원 업무 시간 추적기</h1>
              <p className="subtitle">
                {currentUser.name}님의 업무 시간 관리
                {isSupabaseConfigured && <span className="db-badge">☁️ 클라우드</span>}
              </p>
            </div>
            <div className="header-actions">
              {currentUser.role === 'admin' && (
                <button className="btn-admin" onClick={() => setViewMode('admin')}>
                  관리자 대시보드
                </button>
              )}
              <button className="btn-logout-header" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </div>
        </header>

        <div className="container">
          {/* Timer Section */}
          <div className="timer-section">
            <div className="timer-display">
              {currentEntry ? (
                <>
                  <div className="timer-label">진행 중</div>
                  <div className="timer-time">{formatDuration(getCurrentDuration())}</div>
                  <div className="timer-category">
                    {CATEGORIES.find(c => c.id === currentEntry.category)?.label}
                  </div>
                </>
              ) : (
                <>
                  <div className="timer-label">대기 중</div>
                  <div className="timer-time">00:00:00</div>
                </>
              )}
            </div>

            {!currentEntry ? (
              <div className="category-selector">
                <label>업무 카테고리 선택:</label>
                <div className="category-grid">
                  {CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                      style={{
                        borderColor: selectedCategory === category.id ? category.color : '#e5e7eb',
                        backgroundColor: selectedCategory === category.id ? category.color + '20' : 'transparent'
                      }}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                <button className="start-btn" onClick={startTimer}>
                  시작하기 ▶️
                </button>
              </div>
            ) : (
              <button className="stop-btn" onClick={stopTimer}>
                정지하기 ⏸️
              </button>
            )}
          </div>

          {/* Weekly Summary Section */}
          <div className="summary-section">
            <h2>📊 이번 주 활동 요약</h2>
            <div className="summary-stats">
              <div className="total-hours">
                <div className="total-label">총 업무 시간</div>
                <div className="total-value">{formatHours(totalWeeklySeconds)}시간</div>
                <div className="total-detail">
                  일주일간 {userEntries.filter(e => e.startTime >= Date.now() - 7 * 24 * 60 * 60 * 1000).length}개 활동
                </div>
              </div>
            </div>

            <div className="category-breakdown">
              {CATEGORIES.map(category => {
                const seconds = weeklySummary[category.id] || 0
                const percentage = totalWeeklySeconds > 0 ? (seconds / totalWeeklySeconds) * 100 : 0

                return (
                  <div key={category.id} className="category-item">
                    <div className="category-header">
                      <span className="category-name">{category.label}</span>
                      <span className="category-hours">{formatHours(seconds)}시간</span>
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
                    <div className="category-percentage">{percentage.toFixed(1)}%</div>
                  </div>
                )
              })}
            </div>

            <button className="clear-btn" onClick={clearAllData}>
              내 데이터 초기화 🗑️
            </button>
          </div>

          {/* Recent Entries */}
          {userEntries.length > 0 && (
            <div className="recent-section">
              <h2>📝 최근 활동 내역</h2>
              <div className="entries-list">
                {userEntries.slice(0, 10).map(entry => (
                  <div key={entry.id} className="entry-item">
                    <div
                      className="entry-color"
                      style={{ backgroundColor: CATEGORIES.find(c => c.id === entry.category)?.color }}
                    />
                    <div className="entry-info">
                      <div className="entry-category">
                        {CATEGORIES.find(c => c.id === entry.category)?.label}
                      </div>
                      <div className="entry-time">
                        {new Date(entry.startTime).toLocaleString('ko-KR')}
                      </div>
                      {entry.notes && (
                        <div className="entry-notes">
                          📝 {entry.notes}
                        </div>
                      )}
                    </div>
                    <div className="entry-duration">
                      {formatDuration(entry.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <p>Made with ❤️ for improving academy efficiency</p>
        </footer>
      </div>

      {/* Note Modal */}
      {showNoteModal && pendingEntry && (
        <NoteModal
          category={CATEGORIES.find(c => c.id === pendingEntry.category)?.label || ''}
          duration={pendingEntry.duration}
          onSave={handleSaveNote}
          onSkip={handleSkipNote}
        />
      )}
    </>
  )
}

export default App
