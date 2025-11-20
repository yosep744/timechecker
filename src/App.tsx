import { useState, useEffect } from 'react'
import './App.css'

interface TimeEntry {
  id: string
  category: string
  startTime: number
  endTime?: number
  duration: number
}

interface WeeklySummary {
  [category: string]: number
}

const CATEGORIES = [
  { id: 'teaching', label: '수업/강의', color: '#3b82f6' },
  { id: 'counseling', label: '학생 상담', color: '#10b981' },
  { id: 'admin', label: '행정 업무', color: '#f59e0b' },
  { id: 'preparation', label: '자료 준비', color: '#8b5cf6' },
  { id: 'meeting', label: '회의', color: '#ec4899' },
  { id: 'other', label: '기타', color: '#6b7280' }
]

function App() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id)
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Load entries from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('timeEntries')
    if (stored) {
      setEntries(JSON.parse(stored))
    }
  }, [])

  // Save entries to localStorage
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('timeEntries', JSON.stringify(entries))
    }
  }, [entries])

  // Update current time every second for timer display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const startTimer = () => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      category: selectedCategory,
      startTime: Date.now(),
      duration: 0
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

    setEntries([...entries, completedEntry])
    setCurrentEntry(null)
  }

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

  const getWeeklySummary = (): WeeklySummary => {
    const now = Date.now()
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

    const summary: WeeklySummary = {}
    CATEGORIES.forEach(cat => {
      summary[cat.id] = 0
    })

    entries.forEach(entry => {
      if (entry.startTime >= oneWeekAgo) {
        summary[entry.category] = (summary[entry.category] || 0) + entry.duration
      }
    })

    return summary
  }

  const getTotalWeeklyHours = () => {
    const summary = getWeeklySummary()
    return Object.values(summary).reduce((total, seconds) => total + seconds, 0)
  }

  const clearAllData = () => {
    if (window.confirm('모든 데이터를 삭제하시겠습니까?')) {
      setEntries([])
      setCurrentEntry(null)
      localStorage.removeItem('timeEntries')
    }
  }

  const weeklySummary = getWeeklySummary()
  const totalWeeklySeconds = getTotalWeeklyHours()

  return (
    <div className="app">
      <header className="header">
        <h1>⏱️ 학원 업무 시간 추적기</h1>
        <p className="subtitle">업무 효율을 높이는 시간 관리 도구</p>
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
              <div className="total-detail">일주일간 {entries.filter(e => e.startTime >= Date.now() - 7 * 24 * 60 * 60 * 1000).length}개 활동</div>
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
            데이터 초기화 🗑️
          </button>
        </div>

        {/* Recent Entries */}
        {entries.length > 0 && (
          <div className="recent-section">
            <h2>📝 최근 활동 내역</h2>
            <div className="entries-list">
              {entries.slice(-10).reverse().map(entry => (
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
  )
}

export default App
