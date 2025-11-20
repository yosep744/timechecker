import { useState } from 'react'
import './NoteModal.css'

interface NoteModalProps {
  category: string
  duration: number
  onSave: (notes: string) => void
  onSkip: () => void
}

export default function NoteModal({ category, duration, onSave, onSkip }: NoteModalProps) {
  const [notes, setNotes] = useState('')

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}시간 ${minutes}분`
  }

  const handleSave = () => {
    onSave(notes.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave()
    }
  }

  return (
    <div className="note-modal-overlay" onClick={onSkip}>
      <div className="note-modal" onClick={(e) => e.stopPropagation()}>
        <div className="note-modal-header">
          <h3>📝 업무 메모 작성</h3>
          <button className="close-btn" onClick={onSkip}>×</button>
        </div>

        <div className="note-modal-info">
          <div className="info-item">
            <span className="info-label">카테고리:</span>
            <span className="info-value">{category}</span>
          </div>
          <div className="info-item">
            <span className="info-label">소요 시간:</span>
            <span className="info-value">{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="note-modal-body">
          <label>어떤 업무를 하셨나요?</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예시:&#10;• 중1 수학 - 일차방정식 개념 설명 및 문제풀이&#10;• 김민수 학생 진로상담 - 이과 vs 문과 고민&#10;• 11월 월말평가 문제 출제 및 검토"
            rows={6}
            autoFocus
          />
          <div className="note-hint">
            💡 Ctrl/Cmd + Enter로 빠르게 저장할 수 있습니다
          </div>
        </div>

        <div className="note-modal-footer">
          <button className="btn-skip" onClick={onSkip}>
            나중에 작성
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={!notes.trim()}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  )
}
